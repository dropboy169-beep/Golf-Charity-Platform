import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import subscriptionMiddleware from "../middleware/subscription.middleware.js";
import {
  getDrawHistory,
  getWinners,
} from "../controllers/draw.controller.js";
const router = express.Router();

router.get("/history", getDrawHistory);
router.get("/winners", getWinners);

export default router;