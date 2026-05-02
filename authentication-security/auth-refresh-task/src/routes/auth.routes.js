import express from "express";
import {
  register,
  login,
  refresh,
  logout,
  me,
  getSessions,
  revokeSession,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", authMiddleware, me);

router.get("/sessions", authMiddleware, getSessions);
router.delete("/sessions/:id", authMiddleware, revokeSession);

export default router;