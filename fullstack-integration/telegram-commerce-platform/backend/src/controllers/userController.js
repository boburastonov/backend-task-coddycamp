import User from "../models/User.js";
import { serializeUser } from "../services/tokenService.js";

export async function getProfile(req, res) {
  res.json(serializeUser(req.user));
}

export async function updateProfile(req, res, next) {
  try {
    const updates = Object.fromEntries(
      Object.entries({
        name: req.body.name,
        phone: req.body.phone,
        telegramId: req.body.telegramId,
      }).filter(([, value]) => value !== undefined),
    );

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(serializeUser(user));
  } catch (error) {
    next(error);
  }
}
