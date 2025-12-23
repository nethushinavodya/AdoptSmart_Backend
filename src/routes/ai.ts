import { generateContent } from "../controllers/aiController"
import express from "express";

const router = express.Router();

router.post("/generate", generateContent)

export default router;
