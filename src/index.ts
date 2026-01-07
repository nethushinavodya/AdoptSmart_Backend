import express from "express"
import cors from "cors"
import authRouter from "./routes/authRoutes"
import postRouter from "./routes/petPostRoutes"
import userRouter from "./routes/userRoutes"
import dotenv from "dotenv"
import mongoose from "mongoose"
import successStoryRoutes from "./routes/successStoryRoutes";
import favoriteRoutes from "./routes/favoriteRoutes";
import ai from "./routes/ai";
import adminRoutes from "./routes/adminRoutes";
dotenv.config()

const SERVER_PORT = process.env.SERVER_PORT
const MONGO_URI = process.env.MONGO_URI as string
const FRONTEND_URL = process.env.CLIENT_URL as string
const app = express()

app.use(express.json())
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
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
  .connect(MONGO_URI)
  .then(() => {
    console.log("DB connected")
  })
  .catch((err) => {
    console.error(`DB connection fail: ${err}`)
    process.exit(1)
  })

app.listen(SERVER_PORT, () => {
  console.log(`Server is running on ${SERVER_PORT}`)
})