import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import subscriptionMiddleware from "../middleware/subscription.middleware.js";
import { addScore, getScores, updateScore } from "../controllers/score.controller.js";

const router = express.Router();

router.post("/add", authMiddleware, subscriptionMiddleware, addScore);
router.get("/", authMiddleware, subscriptionMiddleware, getScores);

router.put("/:id", authMiddleware, subscriptionMiddleware, updateScore);

export default router;