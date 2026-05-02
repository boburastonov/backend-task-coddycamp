import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";

const app = express();
const PORT = 5000;

// 1️⃣ cookie-parser
app.use(cookieParser("secretKey"));

// 2️⃣ session
app.use(
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
    },
  })
);

// ---------------- ROUTES ---------------- //

// 3️⃣ SET COOKIE
app.get("/set-cookie", (req, res) => {
  res.cookie("theme", "dark", {
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.send("Cookie set qilindi");
});

// 4️⃣ READ COOKIE
app.get("/read-cookie", (req, res) => {
  res.json({
    theme: req.cookies.theme || null,
  });
});

// 5️⃣ LOGIN (SESSION)
app.get("/login", (req, res) => {
  const { name } = req.query;

  req.session.user = {
    name: name || "Guest",
  };

  res.send("Login bo‘ldi");
});

// 6️⃣ ME (PROTECTED)
app.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  res.json({
    user: req.session.user,
  });
});

// 7️⃣ LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.send("Logout qilindi");
  });
});

// ---------------- BONUS ---------------- //

// Signed cookie yozish
app.get("/set-signed", (req, res) => {
  res.cookie("role", "student", {
    signed: true,
  });

  res.send("Signed cookie yozildi");
});

// Signed cookie o‘qish
app.get("/read-signed", (req, res) => {
  res.json({
    role: req.signedCookies.role || null,
  });
});

// -------------------------------------- //

app.listen(PORT, () => {
  console.log(`Server ishlayapti: http://localhost:${PORT}`);
});