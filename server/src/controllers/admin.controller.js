import supabase from "../config/supabase.js";

export const getAllWinnerRequests = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("winners")
      .select(`
        id,
        match_type,
        prize_amount,
        proof_url,
        verification_status,
        payment_status,
        created_at,
        users(full_name, email),
        draws(draw_month, draw_year)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyWinnerProof = async (req, res) => {
  try {
    const { winnerId, status } = req.body;

    if (!winnerId || !status) {
      return res.status(400).json({ message: "winnerId and status are required" });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be approved or rejected" });
    }

    const { data, error } = await supabase
      .from("winners")
      .update({
        verification_status: status,
      })
      .eq("id", winnerId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json({
      message: `Winner proof ${status} successfully`,
      winner: data,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const markWinnerPaid = async (req, res) => {
  try {
    const { winnerId } = req.body;

    if (!winnerId) {
      return res.status(400).json({ message: "winnerId is required" });
    }

    const { data: existingWinner, error: findError } = await supabase
      .from("winners")
      .select("verification_status, payment_status")
      .eq("id", winnerId)
      .single();

    if (findError) {
      return res.status(500).json({ message: findError.message });
    }

    if (!existingWinner) {
      return res.status(404).json({ message: "Winner not found" });
    }

    if (existingWinner.verification_status !== "approved") {
      return res.status(400).json({
        message: "Winner must be approved before marking as paid",
      });
    }

    const { data, error } = await supabase
      .from("winners")
      .update({
        payment_status: "paid",
      })
      .eq("id", winnerId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json({
      message: "Winner marked as paid",
      winner: data,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, role, subscription_status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const totalUsers = data.length;
    const activeUsers = data.filter(u => u.subscription_status === "active").length;
    const inactiveUsers = totalUsers - activeUsers;

    return res.status(200).json({
      users: data,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: "Only the System Owner (Superadmin) can modify roles." });
    }

    if (!userId || !role) {
      return res.status(400).json({ message: "userId and role required" });
    }

    if (req.user.id === userId && role !== 'superadmin') {
      return res.status(400).json({ message: "You cannot revoke your own Superadmin status. This is for platform security." });
    }

    const { data, error } = await supabase
      .from("users")
      .update({ role })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json({
      message: "User role updated successfully",
      user: data,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAdminAnalytics = async (req, res) => {
  try {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, subscription_status, charity_percentage");

    if (userError) return res.status(500).json({ message: userError.message });

    const totalUsers = userData.length;
    const activeUsers = userData.filter(u => u.subscription_status === "active").length;

    const { data: subData, error: subError } = await supabase
      .from("subscriptions")
      .select("amount, user_id, draw_id");

    if (subError) return res.status(500).json({ message: subError.message });

    let totalRevenue = 0;
    let totalCharityContribution = 0;
    let currentMonthNetPot = 0;

    subData.forEach((sub) => {
      const amount = Number(sub.amount || 0);
      totalRevenue += amount;
      
      const user = userData.find(u => u.id === sub.user_id);
      const charityPercent = user?.charity_percentage || 10;
      
      totalCharityContribution += (amount * (charityPercent / 100));

      // MATCH DRAW ENGINE LOGIC: Only Active Users with Active Subscriptions (not yet assigned to a draw)
      if (!sub.draw_id && user?.subscription_status === 'active') {
        currentMonthNetPot += (amount * (1 - (charityPercent / 100)));
      }
    });

    const { data: poolData, error: poolError } = await supabase
      .from("prize_pools")
      .select("total_pool, rollover_amount")
      .order("created_at", { ascending: false });

    if (poolError) return res.status(500).json({ message: poolError.message });

    const totalPrizePool = poolData.reduce((sum, p) => sum + Number(p.total_pool || 0), 0);
    const currentRollover = poolData.length > 0 ? Number(poolData[0].rollover_amount || 0) : 0;

    // The "Total Prize Pool" as per PRD (Current Pool + Rollover)
    const currentPrizePool = currentMonthNetPot + currentRollover;

    return res.status(200).json({
      totalUsers,
      activeUsers,
      currentPrizePool: Number(currentPrizePool.toFixed(2)),
      totalCharityContribution: Number(totalCharityContribution.toFixed(2)),
      currentRollover: Number(currentRollover.toFixed(2)),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { full_name, email } = req.body;

    if (!userId || !full_name || !email) {
      return res.status(400).json({ message: "userId, full_name, and email are required" });
    }

    const { data: targetUser, error: findError } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (findError || !targetUser) return res.status(404).json({ message: "Target user not found" });

    if ((targetUser.role === 'admin' || targetUser.role === 'superadmin') && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: "You are not authorized to edit other staff accounts. This requires Owner access." });
    }

    const { data, error } = await supabase
      .from("users")
      .update({ full_name, email })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json({
      message: "User profile updated successfully",
      user: data,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!userId || !status) {
      return res.status(400).json({ message: "userId and status are required" });
    }

    const { data: targetUser } = await supabase.from("users").select("role").eq("id", userId).single();
    if (targetUser && (targetUser.role === 'admin' || targetUser.role === 'superadmin') && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: "Access Denied: You cannot modify staff accounts." });
    }

    const { data, error } = await supabase
      .from("users")
      .update({ subscription_status: status })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json({
      message: "User subscription status updated successfully",
      user: data,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserScores = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("played_at", { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserScore = async (req, res) => {
  try {
    const { scoreId } = req.params;
    const { score, played_at } = req.body;

    if (!scoreId || !score || !played_at) {
      return res.status(400).json({ message: "scoreId, score, and played_at are required" });
    }

    const { data: scoreObj } = await supabase.from("scores").select("user_id").eq("id", scoreId).single();
    if (scoreObj) {
      const { data: targetUser } = await supabase.from("users").select("role").eq("id", scoreObj.user_id).single();
      if (targetUser && (targetUser.role === 'admin' || targetUser.role === 'superadmin') && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: "You cannot modify performance data for other staff members." });
      }
    }

    const { data, error } = await supabase
      .from("scores")
      .update({ score, played_at })
      .eq("id", scoreId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json({
      message: "Score updated successfully",
      score: data,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteUserScore = async (req, res) => {
  try {
    const { scoreId } = req.params;

    if (!scoreId) {
      return res.status(400).json({ message: "scoreId is required" });
    }

    const { error } = await supabase
      .from("scores")
      .delete()
      .eq("id", scoreId);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json({
      message: "Score deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addUserScore = async (req, res) => {
  try {
    const { userId } = req.params;
    const { score, played_at } = req.body;

    if (!userId || !score || !played_at) {
      return res.status(400).json({ message: "userId, score, and played_at are required" });
    }

    const { data: targetUser } = await supabase.from("users").select("role").eq("id", userId).single();
    if (targetUser && (targetUser.role === 'admin' || targetUser.role === 'superadmin') && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: "Permission Denied: Only the System Owner can manually adjust staff scores." });
    }

    const { data, error } = await supabase
      .from("scores")
      .insert([{ user_id: userId, score: Number(score), played_at }])
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });

    return res.status(201).json({
      message: "Manual score entry recorded successfully",
      score: data,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};