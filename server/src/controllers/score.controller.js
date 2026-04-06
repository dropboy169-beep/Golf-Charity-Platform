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

    // New: One score per day restriction
    const { data: existingScore, error: checkError } = await supabase
      .from("scores")
      .select("id")
      .eq("user_id", userId)
      .eq("played_at", played_at)
      .maybeSingle();

    if (checkError) return res.status(500).json({ message: checkError.message });
    if (existingScore) {
      return res.status(400).json({ 
        message: "You have already recorded a score for this date. Please edit or delete the existing entry instead." 
      });
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

    let wasPruned = false;
    if (allScores.length > 5) {
      // Identify all IDs that are NOT in the Top 5
      const idsToDelete = allScores.slice(5).map(s => s.id);
      
      // Check if our NEW score is one of the ones being deleted
      if (idsToDelete.includes(insertedData[0].id)) {
        wasPruned = true;
      }

      await supabase
        .from("scores")
        .delete()
        .in("id", idsToDelete);
    }

    if (wasPruned) {
      return res.status(200).json({
        message: "Your entry is older than your current Top 5 and was not added to the Ledger.",
        data: insertedData,
        pruned: true
      });
    }

    return res.status(201).json({
      message: "Score recorded in Ledger successfully",
      data: insertedData,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { score, played_at } = req.body;

    if (score < 1 || score > 45) {
      return res.status(400).json({ message: "Score must be between 1 and 45" });
    }

    const { data, error } = await supabase
      .from("scores")
      .update({ score: Number(score), played_at })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json({
      message: "Score updated successfully",
      data,
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

export const deleteScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Score ID is required" });
    }

    const { error } = await supabase
      .from("scores")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json({
      message: "Score deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};