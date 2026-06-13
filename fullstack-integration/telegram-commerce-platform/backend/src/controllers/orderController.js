import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { getPagination, pagedResponse } from "../services/pagination.js";
import { notifyTelegramAdmins, notifyTelegramUser } from "../services/telegramNotifier.js";
import { createHttpError } from "../utils/httpError.js";

export async function listOrders(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filters = req.user.role === "admin" ? {} : { customer: req.user._id };

    if (req.query.status) {
      filters.status = req.query.status;
    }

    const [items, total] = await Promise.all([
      Order.find(filters)
        .populate("customer", "name email phone telegramId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filters),
    ]);

    res.json(pagedResponse(items, total, page, limit));
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const filters = { _id: req.params.id };
    if (req.user.role !== "admin") {
      filters.customer = req.user._id;
    }

    const order = await Order.findOne(filters).populate("customer", "name email phone telegramId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function createOrder(req, res, next) {
  try {
    const { items = [], deliveryAddress, note } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const productIds = items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));

    const normalizedItems = items.map((item) => {
      const product = productMap.get(String(item.product));
      const quantity = Math.max(1, Number(item.quantity) || 1);

      if (!product) {
        throw createHttpError(400, "One or more products are unavailable");
      }

      if (product.stock < quantity) {
        throw createHttpError(400, `${product.title} stock is not enough`);
      }

      return {
        product: product._id,
        title: product.title,
        price: product.price,
        quantity,
      };
    });

    const total = normalizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await Order.create({
      customer: req.user._id,
      items: normalizedItems,
      total,
      deliveryAddress,
      note,
    });

    await Promise.all(
      normalizedItems.map((item) =>
        Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } }),
      ),
    );

    await notifyTelegramAdmins(
      `New order #${order._id}\\nCustomer: ${req.user.name}\\nTotal: $${total.toFixed(2)}`,
    );
    await notifyTelegramUser(
      req.user.telegramId,
      `Your order #${order._id} was created. Total: $${total.toFixed(2)}`,
    );

    const populatedOrder = await order.populate("customer", "name email phone telegramId");
    return res.status(201).json(populatedOrder);
  } catch (error) {
    next(error);
  }
}

export async function updateOrder(req, res, next) {
  try {
    const updates = Object.fromEntries(
      Object.entries({
        status: req.body.status,
        deliveryAddress: req.body.deliveryAddress,
        note: req.body.note,
      }).filter(([, value]) => value !== undefined),
    );

    const filters = { _id: req.params.id };
    if (req.user.role !== "admin") {
      filters.customer = req.user._id;
      delete updates.status;
    }

    const order = await Order.findOneAndUpdate(filters, updates, {
      new: true,
      runValidators: true,
    }).populate("customer", "name email phone telegramId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (updates.status && order.customer?.telegramId) {
      await notifyTelegramUser(
        order.customer.telegramId,
        `Order #${order._id} status updated: ${order.status}`,
      );
    }

    return res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function deleteOrder(req, res, next) {
  try {
    const filters = { _id: req.params.id };
    if (req.user.role !== "admin") {
      filters.customer = req.user._id;
    }

    const order = await Order.findOneAndDelete(filters);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ message: "Order deleted successfully" });
  } catch (error) {
    next(error);
  }
}
