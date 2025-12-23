import { Router } from "express";
import { approvePetPost, getAllPendingPetPosts } from "../controllers/adminController";
import { authenticate } from "../middlewares/auth";
import { requireRole } from "../middlewares/role";
import { Role } from "../models/userModel";

const router = Router();

router.get("/posts/pending", authenticate, requireRole(Role.Admin), getAllPendingPetPosts);
router.patch("/posts/:id/approve", authenticate, requireRole(Role.Admin), approvePetPost);

export default router;
