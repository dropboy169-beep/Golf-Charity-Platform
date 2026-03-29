import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { getUserAnalytics, getProfile, updateCharityPercentage } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);

router.get("/analytics", authMiddleware, getUserAnalytics);

router.put("/charity-percentage", authMiddleware, updateCharityPercentage);

export default router;