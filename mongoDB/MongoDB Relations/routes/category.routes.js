import express from "express";
import {
  createCategory,
  getCategories,
} from "../controllers/category.controller.js";

const router = express.Router();

router.post("/categories", createCategory);
router.get("/categories", getCategories);

export default router;
