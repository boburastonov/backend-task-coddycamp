import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_EXPIRES,
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: `${process.env.REFRESH_EXPIRES_DAYS}d`,
  });
};

export const hashToken = async (token) => {
  return await bcrypt.hash(token, 10);
};

export const compareToken = async (token, hash) => {
  return await bcrypt.compare(token, hash);
};

export const getRefreshExpiresDate = () => {
  const days = Number(process.env.REFRESH_EXPIRES_DAYS || 7);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};