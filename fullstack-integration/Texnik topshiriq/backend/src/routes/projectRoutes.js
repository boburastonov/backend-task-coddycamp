import { Router } from "express";

import {
  createProject,
  deleteProject,
  getProjectById,
  listProjects,
  updateProject,
} from "../controllers/projectController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", listProjects);
router.get("/:id", getProjectById);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
