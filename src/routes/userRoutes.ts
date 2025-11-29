import { Router } from "express";
import { updateUser , deleteAccount } from "../controllers/userController";
import { upload } from "../middlewares/upload";
import { authenticate as verifyAccessToken } from "../middlewares/auth";

const router = Router();

router.put("/update/:id", verifyAccessToken, upload.single("image"), updateUser);
router.delete("/delete/:id", verifyAccessToken, deleteAccount)

export default router