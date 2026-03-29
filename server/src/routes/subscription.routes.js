import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createCheckoutSession,
  verifyCheckoutSession,
  getMySubscription,
  cancelMySubscription,
  createDonationSession,
  verifyDonationSession,
} from "../controllers/subscription.controller.js";

const router = express.Router();

router.post("/create-checkout-session", authMiddleware, createCheckoutSession);
router.get("/verify-session", authMiddleware, verifyCheckoutSession);
router.get("/me", authMiddleware, getMySubscription);
router.post("/cancel", authMiddleware, cancelMySubscription);

router.post("/create-donation-session", authMiddleware, createDonationSession);
router.get("/verify-donation", authMiddleware, verifyDonationSession);

export default router;