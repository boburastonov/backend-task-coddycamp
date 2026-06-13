import User from "../models/User.js";
import { notifyTelegramAdmins } from "../services/telegramNotifier.js";
import { createToken, serializeUser } from "../services/tokenService.js";

export async function register(req, res, next) {
  try {
    const { name, email, password, phone, telegramId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const userCount = await User.countDocuments();
    const user = await User.create({
      name,
      email,
      password,
      phone,
      telegramId,
      role: userCount === 0 ? "admin" : "user",
    });

    await notifyTelegramAdmins(
      `New registration: ${user.name} (${user.email})`,
    );

    return res.status(201).json({
      token: createToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    const passwordMatches = await user.comparePassword(password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    return res.json({
      token: createToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
}
