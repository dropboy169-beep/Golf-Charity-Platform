import supabase from "../config/supabase.js";

export const addScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { score, played_at } = req.body;
    
    // 1. Validation
    const today = new Date();
    const playedDate = new Date(played_at);
    today.setHours(0, 0, 0, 0);
    playedDate.setHours(0, 0, 0, 0);

    if (playedDate > today) {
      return res.status(400).json({ message: "Future dates are not allowed" });
    }
    if (!score || !played_at) {
      return res.status(400).json({ message: "Score and date required" });
    }
    if (score < 1 || score > 45) {
      return res.status(400).json({ message: "Score must be between 1 and 45" });
    }

    // 2. Record New Performance First
    const { data: insertedData, error: insertError } = await supabase
      .from("scores")
      .insert([{ user_id: userId, score, played_at }])
      .select();

    if (insertError) return res.status(500).json({ message: insertError.message });

    // 3. Perfect Ledger Pruning: Keep only the 5 most recent games
    const { data: allScores, error: fetchError } = await supabase
      .from("scores")
      .select("id")
      .eq("user_id", userId)
      .order("played_at", { ascending: false });

    if (fetchError) return res.status(500).json({ message: fetchError.message });

    if (allScores.length > 5) {
      // Identify all IDs that are NOT in the Top 5
      const idsToDelete = allScores.slice(5).map(s => s.id);
      
      await supabase
        .from("scores")
        .delete()
        .in("id", idsToDelete);
    }

    return res.status(201).json({
      message: "Ledger updated with latest performance",
      data: insertedData,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getScores = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("played_at", { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.json(data);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};