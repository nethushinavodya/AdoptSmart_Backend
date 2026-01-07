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
const PRIMARY_MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGO_URL ||
  process.env.DATABASE_URL ||
  ""; // intentionally allow empty so we can detect missing config
const LOCAL_FALLBACK_URI = "mongodb://127.0.0.1:27017/adoptsmart";
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

// Try primary URI first; on failure attempt local fallback (useful during dev)
// If PRIMARY_MONGO_URI is empty, go straight to local fallback.
async function bootstrap() {
  const attemptConnect = async (uri: string) => {
    try {
      await mongoose.connect(uri);
      console.log(`[mongo] Connected to ${uri.includes("127.0.0.1") ? "local MongoDB" : "MongoDB"}`);
      return true;
    } catch (err: any) {
      console.error(`[mongo] Connection failed for ${uri}: ${err?.message || err}`);
      return false;
    }
  };

  // If no primary provided, warn and try local fallback
  if (!PRIMARY_MONGO_URI) {
    console.warn("[mongo] No MONGO_URI configured; attempting local fallback:", LOCAL_FALLBACK_URI);
    const okLocal = await attemptConnect(LOCAL_FALLBACK_URI);
    if (!okLocal) {
      console.error("[startup] Failed to connect to local MongoDB. Ensure MongoDB is running locally or set MONGO_URI.");
      process.exit(1);
    }
  } else {
    // Try primary
    const okPrimary = await attemptConnect(PRIMARY_MONGO_URI);
    if (!okPrimary) {
      // If primary looks like Atlas, provide actionable hint and try local fallback
      if (/mongodb\+srv|atlas|\.mongodb\.net/i.test(PRIMARY_MONGO_URI)) {
        console.error(
          "\n[mongo] The primary connection (Atlas) failed. Common causes:\n" +
            "- Your current IP is not added to Atlas Network Access (IP whitelist). Add your IP or 0.0.0.0/0 for testing:\n" +
            "  https://www.mongodb.com/docs/atlas/security-whitelist/\n" +
            "- Username/password or connection string is incorrect.\n" +
            "- Network/firewall blocking outgoing connections to Atlas.\n"
        );
      } else {
        console.error("[mongo] Primary MONGO_URI failed to connect.");
      }

      console.warn("[mongo] Attempting local fallback:", LOCAL_FALLBACK_URI);
      const okLocal = await attemptConnect(LOCAL_FALLBACK_URI);
      if (!okLocal) {
        console.error("[startup] Both primary and local MongoDB connections failed. Exiting.");
        process.exit(1);
      } else {
        console.log("[startup] Using local MongoDB fallback. If you intended to use Atlas, fix MONGO_URI and whitelist your IP.");
      }
    }
  }

  // start server after a successful DB connection
  app.listen(Number(SERVER_PORT), () => {
    console.log(`Server is running on ${SERVER_PORT}`);
  });
}

bootstrap();
