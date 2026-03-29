import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
import {
  getAllWinnerRequests,
  verifyWinnerProof,
  markWinnerPaid,
  getAllUsers,
  updateUserRole,
  getAdminAnalytics,
  updateUserProfile,
  updateUserSubscription,
  getUserScores,
  updateUserScore,
  deleteUserScore,
  addUserScore,
} from "../controllers/admin.controller.js";
import { runDraw } from "../controllers/draw.controller.js";

const router = express.Router();

router.get("/analytics", authMiddleware, adminMiddleware, getAdminAnalytics);
router.get("/winners", authMiddleware, adminMiddleware, getAllWinnerRequests);
router.post("/winners/verify", authMiddleware, adminMiddleware, verifyWinnerProof);
router.post("/winners/pay", authMiddleware, adminMiddleware, markWinnerPaid);
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.post("/users/role", authMiddleware, adminMiddleware, updateUserRole);
router.put("/users/:userId/profile", authMiddleware, adminMiddleware, updateUserProfile);
router.put("/users/:userId/subscription", authMiddleware, adminMiddleware, updateUserSubscription);
router.get("/users/:userId/scores", authMiddleware, adminMiddleware, getUserScores);
router.post("/users/:userId/scores", authMiddleware, adminMiddleware, addUserScore);
router.put("/scores/:scoreId", authMiddleware, adminMiddleware, updateUserScore);
router.delete("/scores/:scoreId", authMiddleware, adminMiddleware, deleteUserScore);
router.post("/draws/run", authMiddleware, adminMiddleware, runDraw);

export default router;