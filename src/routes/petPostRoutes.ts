import express from "express";
import {
  savePetPost,
  getAllPets,
  getMyPets,
  updatePetPost,
  deletePetPost,
  getApprovedPets,
  getPendingPets,
} from "../controllers/postController";
import { upload } from "../middlewares/upload";
import { authenticate as verifyAccessToken } from "../middlewares/auth";
import { contactOwnerToAdoptPet } from "../controllers/postEmailController";

const router = express.Router();

router.post("/save", verifyAccessToken, upload.single("image"), savePetPost);
router.get("/getAll", getAllPets);
router.get("/approved", getApprovedPets);
router.get("/pending", verifyAccessToken, getPendingPets);
router.get("/me", verifyAccessToken, getMyPets);
router.put("/update/:id", verifyAccessToken, upload.single("image"), updatePetPost);
router.delete("/delete/:id", verifyAccessToken, deletePetPost);
router.post("/contact-owner/:postId", verifyAccessToken, contactOwnerToAdoptPet);

export default router;
