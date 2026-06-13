import BotSubscriber from "../models/BotSubscriber.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { broadcastToSubscribers } from "../services/telegramNotifier.js";
import { createHttpError } from "../utils/httpError.js";

export async function getStats(_req, res, next) {
  try {
    const [users, products, orders, subscribers, revenue] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      BotSubscriber.countDocuments({ isBlocked: false }),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    res.json({
      users,
      products,
      orders,
      subscribers,
      revenue: revenue[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
}

export async function listUsers(_req, res, next) {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).limit(100);
    res.json({ items: users });
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      throw createHttpError(400, "Role must be user or admin");
    }

    if (String(req.user._id) === String(req.params.id) && role !== "admin") {
      throw createHttpError(400, "You cannot remove your own admin role");
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      throw createHttpError(404, "User not found");
    }

    return res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function broadcast(req, res, next) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Broadcast message is required" });
    }

    const subscribers = await BotSubscriber.find({ isBlocked: false });
    const result = await broadcastToSubscribers(subscribers, message);

    return res.json(result);
  } catch (error) {
    next(error);
  }
}
