import supabase from "../config/supabase.js";
import stripe from "../config/stripe.js";

export const createCheckoutSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const userEmail = req.user.email;
        const { plan } = req.body;
        const { data: existingUser, error: existingUserError } = await supabase
            .from("users")
            .select("subscription_status, renewal_date, subscription_plan")
            .eq("id", userId)
            .single();

        if (existingUserError) {
            return res.status(500).json({ message: existingUserError.message });
        }

        const now = new Date();
        const renewalDate = existingUser?.renewal_date
            ? new Date(existingUser.renewal_date)
            : null;

        if (
            existingUser?.subscription_status === "active" &&
            renewalDate &&
            renewalDate > now &&
            existingUser?.subscription_plan === plan
        ) {
            return res.status(400).json({
                message: `You already have an active ${plan} subscription`,
            });
        }

        if (!plan || !["monthly", "yearly"].includes(plan)) {
            return res.status(400).json({ message: "Valid plan is required" });
        }

        const priceId =
            plan === "monthly"
                ? process.env.STRIPE_MONTHLY_PRICE_ID
                : process.env.STRIPE_YEARLY_PRICE_ID;

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer_email: userEmail,
            metadata: {
                userId,
                plan,
            },
            success_url: `${process.env.CLIENT_URL}/subscribe-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/subscribe-cancel`,
        });

        return res.status(200).json({
            url: session.url,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const verifyCheckoutSession = async (req, res) => {
    try {
        const { session_id } = req.query;

        if (!session_id) {
            return res.status(400).json({ message: "session_id is required" });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== "paid") {
            return res.status(400).json({ message: "Payment not completed" });
        }

        const userId = session.metadata.userId;
        const plan = session.metadata.plan;

        const renewalDate = new Date();
        if (plan === "monthly") {
            renewalDate.setMonth(renewalDate.getMonth() + 1);
        } else {
            renewalDate.setFullYear(renewalDate.getFullYear() + 1);
        }

        const { data: updatedUser, error: userError } = await supabase
            .from("users")
            .update({
                subscription_status: "active",
                subscription_plan: plan,
                renewal_date: renewalDate.toISOString(),
            })
            .eq("id", userId)
            .select()
            .single();

        if (userError) {
            return res.status(500).json({ message: userError.message });
        }
        const { data: existingSubscription, error: existingSubError } = await supabase
            .from("subscriptions")
            .select("id")
            .eq("stripe_subscription_id", session.subscription)
            .maybeSingle();

        if (existingSubError) {
            return res.status(500).json({ message: existingSubError.message });
        }

        if (existingSubscription) {
            return res.status(200).json({
                message: "Subscription already verified",
                user: updatedUser,
            });
        }

        // const { error: subError } = await supabase
        //   .from("subscriptions")
        //   .insert([
        //     {
        //       user_id: userId,
        //       stripe_customer_id: session.customer,
        //       stripe_subscription_id: session.subscription,
        //       plan,
        //       amount: 0,
        //       status: "active",
        //       start_date: new Date().toISOString(),
        //       end_date: renewalDate.toISOString(),
        //     },
        //   ]);

        const amount =
            plan === "monthly"
                ? Number(process.env.STRIPE_MONTHLY_AMOUNT)
                : Number(process.env.STRIPE_YEARLY_AMOUNT);

        const { error: subError } = await supabase
            .from("subscriptions")
            .insert([
                {
                    user_id: userId,
                    stripe_customer_id: session.customer,
                    stripe_subscription_id: session.subscription,
                    plan,
                    amount,
                    status: "active",
                    start_date: new Date().toISOString(),
                    end_date: renewalDate.toISOString(),
                },
            ]);

        if (subError) {
            return res.status(500).json({ message: subError.message });
        }

        return res.status(200).json({
            message: "Subscription activated successfully",
            user: updatedUser,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getMySubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: user, error } = await supabase
      .from("users")
      .select("id, full_name, email, role, subscription_status, subscription_plan, renewal_date, charity_percentage, charity_id")
      .eq("id", userId)
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();
    const renewalDate = user.renewal_date ? new Date(user.renewal_date) : null;

    if (renewalDate && renewalDate < now && user.subscription_status === "active") {
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({ subscription_status: "lapsed" })
        .eq("id", userId)
        .select("id, full_name, email, role, subscription_status, subscription_plan, renewal_date, charity_percentage, charity_id")
        .single();

      if (updateError) {
        return res.status(500).json({ message: updateError.message });
      }

      return res.status(200).json(updatedUser);
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createDonationSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const userEmail = req.user.email;
        const { charityId, amount } = req.body;

        if (!charityId || !amount || amount < 1) {
            return res.status(400).json({ message: "Valid charity and amount (min ₹1) required" });
        }

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: `Direct Donation to Charity`,
                            description: "Independent contribution not tied to monthly draw entries.",
                        },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            customer_email: userEmail,
            metadata: {
                userId,
                charityId,
                isDonation: "true",
            },
            success_url: `${process.env.CLIENT_URL}/dashboard?donation=success`,
            cancel_url: `${process.env.CLIENT_URL}/charities`,
        });

        return res.status(200).json({
            url: session.url,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const verifyDonationSession = async (req, res) => {
    try {
        const { session_id } = req.query;
        if (!session_id) return res.status(400).json({ message: "session_id required" });

        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status !== "paid") return res.status(400).json({ message: "Payment failed" });

        const { userId, charityId, isDonation } = session.metadata;
        if (isDonation !== "true") return res.status(400).json({ message: "Not a donation session" });

        const { error } = await supabase
            .from("subscriptions")
            .insert([
                {
                    user_id: userId,
                    stripe_customer_id: session.customer || "direct_pay",
                    stripe_subscription_id: `donation_${session.id}`,
                    plan: "donation",
                    amount: session.amount_total / 100,
                    status: "active",
                    start_date: new Date().toISOString(),
                    end_date: new Date().toISOString(),
                },
            ]);

        if (error) return res.status(500).json({ message: error.message });

        return res.status(200).json({ message: "Donation successful" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
export const cancelMySubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("subscription_status")
      .eq("id", userId)
      .single();

    if (userError) {
      return res.status(500).json({ message: userError.message });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.subscription_status !== "active") {
      return res.status(400).json({ message: "No active subscription to cancel" });
    }

    const { data: updatedUser, error: updateUserError } = await supabase
      .from("users")
      .update({
        subscription_status: "cancelled",
      })
      .eq("id", userId)
      .select("id, full_name, email, role, subscription_status, subscription_plan, renewal_date, charity_percentage, charity_id")
      .single();

    if (updateUserError) {
      return res.status(500).json({ message: updateUserError.message });
    }

    const { error: subError } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
      })
      .eq("user_id", userId)
      .eq("status", "active");

    if (subError) {
      return res.status(500).json({ message: subError.message });
    }

    return res.status(200).json({
      message: "Subscription cancelled successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};