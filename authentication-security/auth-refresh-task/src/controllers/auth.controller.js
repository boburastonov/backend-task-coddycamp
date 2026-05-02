import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import RefreshSession from "../models/RefreshSession.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  compareToken,
  getRefreshExpiresDate,
} from "../utils/token.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "strict",
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existsUser = await User.findOne({ email });

    if (existsUser) {
      return res.status(400).json({ message: "Bu email allaqachon mavjud" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    return res.status(201).json({
      message: "User yaratildi",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, deviceName } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Email yoki parol noto‘g‘ri" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: "Email yoki parol noto‘g‘ri" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    const refreshTokenHash = await hashToken(refreshToken);

    await RefreshSession.create({
      userId: user._id,
      refreshTokenHash,
      deviceName: deviceName || "Unknown device",
      ip: req.ip,
      expiresAt: getRefreshExpiresDate(),
    });

    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({ message: "Refresh token topilmadi" });
    }

    let decoded;

    try {
      decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      res.clearCookie("refreshToken");
      return res.status(401).json({ message: "Refresh token eskirgan yoki noto‘g‘ri" });
    }

    const sessions = await RefreshSession.find({
      userId: decoded.userId,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    let matchedSession = null;

    for (const session of sessions) {
      const isMatch = await compareToken(oldRefreshToken, session.refreshTokenHash);

      if (isMatch) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) {
      res.clearCookie("refreshToken");
      return res.status(401).json({ message: "Sessiya topilmadi" });
    }

    matchedSession.revokedAt = new Date();
    await matchedSession.save();

    const newAccessToken = generateAccessToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);
    const newRefreshTokenHash = await hashToken(newRefreshToken);

    await RefreshSession.create({
      userId: decoded.userId,
      refreshTokenHash: newRefreshTokenHash,
      deviceName: matchedSession.deviceName,
      ip: req.ip,
      expiresAt: getRefreshExpiresDate(),
    });

    res.cookie("refreshToken", newRefreshToken, cookieOptions);

    return res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(200).json({ message: "Logout qilindi" });
    }

    const sessions = await RefreshSession.find({
      revokedAt: null,
    });

    for (const session of sessions) {
      const isMatch = await compareToken(refreshToken, session.refreshTokenHash);

      if (isMatch) {
        session.revokedAt = new Date();
        await session.save();
        break;
      }
    }

    res.clearCookie("refreshToken");

    return res.json({ message: "Logout qilindi" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User topilmadi" });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await RefreshSession.find({ userId: req.userId }).select(
      "deviceName ip createdAt revokedAt expiresAt"
    );

    return res.json(sessions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const revokeSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await RefreshSession.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!session) {
      return res.status(404).json({ message: "Sessiya topilmadi" });
    }

    session.revokedAt = new Date();
    await session.save();

    return res.json({ message: "Sessiya revoke qilindi" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};