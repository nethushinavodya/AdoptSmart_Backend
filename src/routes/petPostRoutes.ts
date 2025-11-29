import express from "express";
import {
  savePetPost,
  getAllPets,
  getMyPets,
  updatePetPost,
  deletePetPost,
} from "../controllers/postController";
import { upload } from "../middlewares/upload";
import { authenticate as verifyAccessToken } from "../middlewares/auth";

const router = express.Router();

router.post("/save", verifyAccessToken, upload.single("image"), savePetPost);
router.get("/getAll", getAllPets);
router.get("/me", verifyAccessToken, getMyPets);
router.put("/update/:id", verifyAccessToken, upload.single("image"), updatePetPost);
router.delete("/delete/:id", verifyAccessToken, deletePetPost);

export default router;
