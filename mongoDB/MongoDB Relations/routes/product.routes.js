import express from "express";
import {
  createProduct,
  getProducts,
  getProductsByCategory,
} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/products", createProduct);
router.get("/products", getProducts);
router.get("/categories/:id/products", getProductsByCategory);

export default router;
