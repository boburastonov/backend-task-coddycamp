import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const PORT = 5000;

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
];

const corsOptions = {
  origin(origin, callback) {
    // Postman, curl yoki server-to-server requestlarda origin bo‘lmasligi mumkin
    if (!origin) {
      return callback(null, true);
    }

    // Dev uchun: CORS_ORIGIN bo‘sh bo‘lsa hammaga ruxsat
    if (!process.env.CORS_ORIGIN) {
      return callback(null, true);
    }

    const whitelist = process.env.CORS_ORIGIN.split(",");

    if (whitelist.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS_BLOCKED"));
  },
  credentials: true,
};

app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());

// GET /api/ping
app.get("/api/ping", (req, res) => {
  res.json({ ok: true });
});

// POST /api/echo
app.post("/api/echo", (req, res) => {
  res.json({
    body: req.body,
  });
});

// GET /api/secure-headers
app.get("/api/secure-headers", (req, res) => {
  res.json({
    "x-dns-prefetch-control": res.getHeader("x-dns-prefetch-control"),
    "x-frame-options": res.getHeader("x-frame-options"),
    "x-content-type-options": res.getHeader("x-content-type-options"),
  });
});

// CORS error handler
app.use((err, req, res, next) => {
  if (err.message === "CORS_BLOCKED") {
    return res.status(403).json({
      error: "CORS bloklandi",
      hint: "CORS_ORIGIN ga frontend URL qo‘shing",
    });
  }

  res.status(500).json({
    error: err.message,
  });
});

// 0.0.0.0 test uchun
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running: http://0.0.0.0:${PORT}`);
});