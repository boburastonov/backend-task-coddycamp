import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDb from "./utils/connectDb.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(express.json());
app.use("/api", userRoutes);

connectDb();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
