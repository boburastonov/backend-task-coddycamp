import Product from "../models/Product.js";
import { getPagination, pagedResponse } from "../services/pagination.js";

export async function listProducts(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filters = {};

    if (req.query.category) {
      filters.category = req.query.category;
    }

    if (req.query.active !== undefined) {
      filters.isActive = req.query.active === "true";
    }

    const [items, total] = await Promise.all([
      Product.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filters),
    ]);

    res.json(pagedResponse(items, total, page, limit));
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    const { title, description, price, stock, category, isActive } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({ message: "Product title and price are required" });
    }

    const product = await Product.create({
      title,
      description,
      price,
      stock,
      category,
      isActive,
      owner: req.user._id,
    });

    return res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const updates = Object.fromEntries(
      Object.entries({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        stock: req.body.stock,
        category: req.body.category,
        isActive: req.body.isActive,
      }).filter(([, value]) => value !== undefined),
    );

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
}
