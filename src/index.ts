import express from "express"
import cors from "cors"
import authRouter from "./routes/authRoutes"
import postRouter from "./routes/petPostRoutes"
import userRouter from "./routes/userRoutes"
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose"
import successStoryRoutes from "./routes/successStoryRoutes";
import favoriteRoutes from "./routes/favoriteRoutes";
import ai from "./routes/ai";
import adminRoutes from "./routes/adminRoutes";

// Detect deprecated npm config usage and advise correct flag
if (typeof process.env.npm_config_production !== "undefined") {
  console.warn(
    "[npm config] Detected use of the deprecated npm `production` config. " +
      "Prefer `npm install --omit=dev` (or set NODE_ENV) instead of relying on npm config 'production'."
  );
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "production";
  }
}

// Safe defaults
const SERVER_PORT = process.env.SERVER_PORT || "5000";

// Ensure we read the env var(s) in a robust way and never pass undefined to mongoose
const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGO_URL || // sometimes named differently
  process.env.DATABASE_URL || // another common name
  "mongodb://127.0.0.1:27017/adoptsmart"; // local fallback for dev

if (
  !process.env.MONGO_URI &&
  !process.env.MONGO_URL &&
  !process.env.DATABASE_URL
) {
  console.warn(
    "[startup] WARNING: No remote Mongo DB URI provided via env (MONGO_URI/MONGO_URL/DATABASE_URL). Using local fallback:",
    MONGO_URI
  );
}

const app = express()

app.use(express.json())
app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
    })
)

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/post", postRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/successStory", successStoryRoutes)
app.use("/api/v1/favorites", favoriteRoutes);
app.use("/api/v1/ai", ai);
app.use("/api/v1/admin", adminRoutes);

mongoose
  .connect(MONGO_URI, {
    // ...existing options...
    // e.g., useNewUrlParser: true, useUnifiedTopology: true
  } as mongoose.ConnectOptions)
  .then(() => {
    console.log("[startup] MongoDB connected");
    app.listen(Number(SERVER_PORT), () => {
      console.log(`Server is running on ${SERVER_PORT}`)
    })
  })
  .catch((err) => {
    console.error("[startup] MongoDB connection error:", err);
    process.exit(1); // fail fast so you notice the config issue
  })
