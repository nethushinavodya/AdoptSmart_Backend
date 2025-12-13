import express from "express";
import {
  createSuccessStory,
  deleteSuccessStory,
  getAllSuccessStories,
  getMySuccessStories,
} from "../controllers/successStoryController";
import { authenticate } from "../middlewares/auth";
import {upload} from "../middlewares/upload";

const router = express.Router();

router.post(
  "/save",
  authenticate,
  upload.array("images", 4),
  createSuccessStory
);

router.get("/getAll", getAllSuccessStories);
router.get("/myStories", authenticate, getMySuccessStories);
router.delete("/delete/:id", authenticate, deleteSuccessStory);

export default router;
