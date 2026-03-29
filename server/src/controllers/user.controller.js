import supabase from "../config/supabase.js";

export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("charity_percentage")
      .eq("id", userId)
      .single();

    if (userError) {
      return res.status(500).json({ message: userError.message });
    }

    const charityPercentage = userData.charity_percentage || 10;

    const { data: subsData, error: subsError } = await supabase
      .from("subscriptions")
      .select("amount, status")
      .eq("user_id", userId);

    if (subsError) {
      return res.status(500).json({ message: subsError.message });
    }

    const totalAmount = subsData.reduce((sum, sub) => sum + Number(sub.amount || 0), 0);
    const activeSub = subsData.find(s => s.status === 'active');
    const activeAmount = activeSub ? Number(activeSub.amount || 0) : 0;
    
    const totalContributed = Number((totalAmount * (charityPercentage / 100)).toFixed(2));
    const activeContributed = Number((activeAmount * (charityPercentage / 100)).toFixed(2));

    return res.status(200).json({
      totalContributed,
      activeContributed,
      charityPercentage,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, role, subscription_status, charity_percentage, created_at")
      .eq("id", userId)
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const updateCharityPercentage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { percentage } = req.body;

    if (percentage < 10 || percentage > 100) {
      return res.status(400).json({ message: "Percentage must be between 10 and 100" });
    }

    const { data, error } = await supabase
      .from("users")
      .update({ charity_percentage: percentage })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json({
      message: "Charity percentage updated successfully",
      user: data,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
