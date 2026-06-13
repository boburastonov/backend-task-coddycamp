import { Router } from "express";

import { getProfile, updateProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);
router.get("/me", getProfile);
router.put("/me", updateProfile);

export default router;
