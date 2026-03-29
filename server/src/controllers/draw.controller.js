import supabase from "../config/supabase.js";
import notificationService from "../services/notification.service.js";

const calculatePrizePool = async () => {
  const { data: activeSubs, error } = await supabase
    .from("subscriptions")
    .select("amount")
    .eq("status", "active");

  if (error) {
    throw new Error(error.message);
  }

  const totalPool = activeSubs.reduce((sum, sub) => sum + Number(sub.amount || 0), 0);
  
  // Fetch previous draw's rollover if it exists
  const { data: prevPool } = await supabase
    .from("prize_pools")
    .select("rollover_amount")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const rollover = prevPool?.rollover_amount ? Number(prevPool.rollover_amount) : 0;

  return {
    totalPool: totalPool + rollover,
    basePool: totalPool,
    pool5: Number((totalPool * 0.4).toFixed(2)) + rollover,
    pool4: Number((totalPool * 0.35).toFixed(2)),
    pool3: Number((totalPool * 0.25).toFixed(2)),
    rolloverApplied: rollover
  };
};

const generateRandomNumbers = () => {
  const nums = new Set();
  while (nums.size < 5) {
    nums.add(Math.floor(Math.random() * 45) + 1);
  }
  return [...nums].sort((a,b)=>a-b);
};

const generateAlgorithmicNumbers = async () => {
  // fetch all scores to calculate frequency
  const { data: scores } = await supabase.from("scores").select("score");
  if (!scores || scores.length === 0) return generateRandomNumbers();

  const frequency = {};
  scores.forEach(s => {
    frequency[s.score] = (frequency[s.score] || 0) + 1;
  });

  // weighted random selection
  const pool = [];
  Object.keys(frequency).forEach(scoreNum => {
    const weight = frequency[scoreNum];
    // add number to pool 'weight' times to increase probability naturally
    for(let i=0; i<weight; i++){
      pool.push(Number(scoreNum));
    }
  });

  const nums = new Set();
  // fallback if somehow we can't get 5 unique nums from the pool (e.g. only 3 unique scores ever submitted)
  let attempts = 0;
  while (nums.size < 5 && attempts < 1000) {
    const randomIdx = Math.floor(Math.random() * pool.length);
    nums.add(pool[randomIdx]);
    attempts++;
  }
  
  // if still < 5, fill with completely random numbers
  while (nums.size < 5) {
     nums.add(Math.floor(Math.random() * 45) + 1);
  }
  return [...nums].sort((a,b)=>a-b);
};

export const runDraw = async (req, res) => {
  try {
    const { simulate = false, algorithmType = "random", forceNumbers = null } = req.body;
    
    let drawNumbers = [];

    if (forceNumbers && Array.isArray(forceNumbers) && forceNumbers.length === 5) {
      // Manual Override (Test Mode)
      drawNumbers = forceNumbers.map(Number).sort((a, b) => a - b);
    } else if (algorithmType === "algorithmic") {
      drawNumbers = await generateAlgorithmicNumbers();
    } else {
      drawNumbers = generateRandomNumbers();
    }

    const prizePool = await calculatePrizePool();

    const now = new Date();
    const drawMonth = now.toLocaleString("default", { month: "long" });
    const drawYear = now.getFullYear();

    // get all users
    const { data: users } = await supabase
      .from("users")
      .select("id, full_name, email");

    const results = [];
    const winners5 = [];
    const winners4 = [];
    const winners3 = [];

    for (let user of users) {
      const { data: scores } = await supabase
        .from("scores")
        .select("score")
        .eq("user_id", user.id);

      const userScores = scores.map((s) => s.score);
      const matchedNumbers = userScores.filter((s) => drawNumbers.includes(s));
      const matchCount = matchedNumbers.length;

      let matchType = null;

      if (matchCount >= 5) {
        matchType = 5;
        winners5.push(user);
      } else if (matchCount === 4) {
        matchType = 4;
        winners4.push(user);
      } else if (matchCount === 3) {
        matchType = 3;
        winners3.push(user);
      }

      results.push({
        user_id: user.id,
        name: user.full_name,
        email: user.email,
        matches: matchCount,
        matchedNumbers,
        matchType,
      });
    }

    const prizePerWinner5 = winners5.length > 0 ? prizePool.pool5 / winners5.length : 0;
    const prizePerWinner4 = winners4.length > 0 ? prizePool.pool4 / winners4.length : 0;
    const prizePerWinner3 = winners3.length > 0 ? prizePool.pool3 / winners3.length : 0;
    
    const unspentRollover = winners5.length === 0 ? prizePool.pool5 : 0;

    const finalResults = results.filter((user) => user.matchType).map((user) => {
      let prizeAmount = 0;
      if (user.matchType === 5) prizeAmount = prizePerWinner5;
      if (user.matchType === 4) prizeAmount = prizePerWinner4;
      if (user.matchType === 3) prizeAmount = prizePerWinner3;

      return {
        ...user,
        prizeAmount: Number(prizeAmount.toFixed(2)),
      };
    });

    // IF SIMULATION -> just return the calculated projected winners and STOP.
    if (simulate === true || simulate === "true") {
       return res.json({
         simulation: true,
         drawNumbers,
         prizePool,
         unspentRollover, // Amount carrying forward to NEXT month
         results: finalResults,
         summary: {
           winners5: winners5.length,
           winners4: winners4.length,
           winners3: winners3.length,
         },
       });
    }

    // --- OFFICIAL PUBLISH PIPELINE ---
    if (simulate === false || simulate === "false") {
      // Check if a draw for this month/year already exists
      const { data: existingDraw } = await supabase
        .from("draws")
        .select("id")
        .eq("draw_month", drawMonth)
        .eq("draw_year", drawYear)
        .eq("status", "published")
        .maybeSingle();

      if (existingDraw) {
        return res.status(400).json({ 
          message: `An official draw for ${drawMonth} ${drawYear} has already been published. Only one official draw per month is permitted.` 
        });
      }
    }

    const { data: drawRow, error: drawError } = await supabase
      .from("draws")
      .insert([
        {
          draw_month: drawMonth,
          draw_year: drawYear,
          draw_type: algorithmType,
          winning_numbers: drawNumbers,
          status: "published",
          jackpot_rollover: unspentRollover, // Save for the history reference
          published_at: now.toISOString(),
        },
      ])
      .select()
      .single();

    if (drawError) return res.status(500).json({ message: drawError.message });

    const { error: poolError } = await supabase
      .from("prize_pools")
      .insert([
        {
          draw_id: drawRow.id,
          total_pool: prizePool.totalPool,
          pool_5_match: prizePool.pool5,
          pool_4_match: prizePool.pool4,
          pool_3_match: prizePool.pool3,
          rollover_amount: unspentRollover, // The physical untaken pot that applies to Next month
        },
      ]);

    if (poolError) return res.status(500).json({ message: poolError.message });

    const winnerRows = finalResults.map((user) => ({
      draw_id: drawRow.id,
      user_id: user.user_id,
      match_type: user.matchType,
      prize_amount: user.prizeAmount,
      verification_status: "pending",
      payment_status: "pending",
    }));

    if (winnerRows.length > 0) {
      const { error: winnersError } = await supabase
        .from("winners")
        .insert(winnerRows);
      if (winnersError) return res.status(500).json({ message: winnersError.message });

      // ASYNC NOTIFICATION TRIGGER
      // We don't wait for emails to send before responding to the admin UI, to keep it snappy.
      finalResults.forEach(winner => {
        notificationService.sendWinnerEmail({
          email: winner.email,
          name: winner.name,
          prizeAmount: winner.prizeAmount,
          matchType: winner.matchType,
          drawMonth,
          drawYear
        });
      });
    }

    return res.json({
      simulation: false,
      drawId: drawRow.id,
      drawNumbers,
      prizePool,
      unspentRollover,
      results: finalResults,
      summary: {
        winners5: winners5.length,
        winners4: winners4.length,
        winners3: winners3.length,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDrawHistory = async (req, res) => {
  try {
    const { data: draws, error } = await supabase
      .from("draws")
      .select(`
        id,
        draw_month,
        draw_year,
        winning_numbers,
        status,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json(draws);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getWinners = async (req, res) => {
  try {
    const { data: winners, error } = await supabase
      .from("winners")
      .select(`
        id,
        match_type,
        prize_amount,
        verification_status,
        payment_status,
        created_at,
        users(full_name),
        draws(draw_month, draw_year)
      `)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json(winners);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};