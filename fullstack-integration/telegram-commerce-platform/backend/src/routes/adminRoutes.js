import { Router } from "express";

import { broadcast, getStats, listUsers, updateUserRole } from "../controllers/adminController.js";
import { adminMiddleware, authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get("/stats", getStats);
router.get("/users", listUsers);
router.patch("/users/:id/role", updateUserRole);
router.post("/broadcast", broadcast);

export default router;
