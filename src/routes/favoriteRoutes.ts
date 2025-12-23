import express from "express";
import { addFavorite, removeFavorite, getMyFavorites, isFavorited } from "../controllers/favoritesController";
import { authenticate } from "../middlewares/auth";

const router = express.Router();

router.get("/me", authenticate, getMyFavorites);
router.get("/isFavorite/:petId", authenticate, isFavorited);
router.post("/add/:petId", authenticate, addFavorite);
router.delete("/remove/:petId", authenticate, removeFavorite);

export default router;
