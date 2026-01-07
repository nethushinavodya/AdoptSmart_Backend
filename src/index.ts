import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRouter from "./routes/authRoutes";
import postRouter from "./routes/petPostRoutes";
import userRouter from "./routes/userRoutes";
import successStoryRoutes from "./routes/successStoryRoutes";
import favoriteRoutes from "./routes/favoriteRoutes";
import ai from "./routes/ai";
import adminRoutes from "./routes/adminRoutes";


// Robust env handling with sensible fallbacks
const SERVER_PORT = process.env.SERVER_PORT || "5000";
const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGO_URL ||
  process.env.DATABASE_URL ||
  "mongodb://127.0.0.1:27017/adoptsmart"; // local fallback for dev
const FRONTEND_URL = process.env.CLIENT_URL || "*";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/post", postRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/successStory", successStoryRoutes);
app.use("/api/v1/favorites", favoriteRoutes);
app.use("/api/v1/ai", ai);
app.use("/api/v1/admin", adminRoutes);

// Connect to MongoDB with clearer error messages
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("DB connected");
    // Start server after successful DB connection
    app.listen(Number(SERVER_PORT), () => {
      console.log(`Server is running on ${SERVER_PORT}`);
    });
  })
  .catch((err: any) => {
    console.error(`DB connection fail: ${err?.name ? err.name + ": " : ""}${err?.message || err}`);
    // Helpful hint for common Atlas issues
    const msg = String(err?.message || "");
    if (/whitelist|IP|not authorized|ECONNREFUSED|server selection|authentication/i.test(msg)) {
      console.error(
        "\nCommon causes:\n" +
          "- MongoDB URI is incorrect (check username/password and replica set name).\n" +
          "- Your IP is not allowed in MongoDB Atlas Network Access (add your IP or use 0.0.0.0/0 for testing):\n" +
          "  https://www.mongodb.com/docs/atlas/security-whitelist/\n" +
          "- Network/firewall blocking outbound connections to Atlas.\n"
      );
    }
    process.exit(1);
  });
