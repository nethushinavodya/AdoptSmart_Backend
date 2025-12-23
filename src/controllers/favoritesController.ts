import { Request, Response } from "express";
import mongoose from "mongoose";
import { Favorite } from "../models/favorites";
import { Pet } from "../models/PetPostModel";

type AuthedRequest = Request & { user?: any };

const getAuthedUserId = (req: AuthedRequest) => req.user?.sub || req.user?._id || req.user?.id;

export const addFavorite = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = getAuthedUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { petId } = req.params as { petId: string };
    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ message: "Invalid petId" });
    }

    const petExists = await Pet.exists({ _id: petId });
    if (!petExists) return res.status(404).json({ message: "Pet post not found" });

    const existing = await Favorite.findOne({ userId, petId });
    if (existing) return res.status(200).json({ message: "Already in favorites" });

    await Favorite.create({ userId, petId });
    return res.status(201).json({ message: "Added to favorites" });
  } catch (err: any) {
    if (err?.code === 11000) return res.status(200).json({ message: "Already in favorites" });
    return res.status(500).json({ message: "Failed to add favorite" });
  }
};

export const removeFavorite = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = getAuthedUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { petId } = req.params as { petId: string };
    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ message: "Invalid petId" });
    }

    await Favorite.deleteOne({ userId, petId });
    return res.status(200).json({ message: "Removed from favorites" });
  } catch {
    return res.status(500).json({ message: "Failed to remove favorite" });
  }
};

export const getMyFavorites = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = getAuthedUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Favorite.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "petId",
          populate: { path: "ownerId", select: "username email profilePicture contactNumber location" },
        }),
      Favorite.countDocuments({ userId }),
    ]);

    const pets = items
      .map((f: any) => f.petId)
      .filter(Boolean);

    return res.status(200).json({
      page,
      limit,
      total,
      data: pets,
    });
  } catch {
    return res.status(500).json({ message: "Failed to fetch favorites" });
  }
};

export const isFavorited = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = getAuthedUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { petId } = req.params as { petId: string };
    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ message: "Invalid petId" });
    }

    const exists = await Favorite.exists({ userId, petId });
    return res.status(200).json({ favorited: Boolean(exists) });
  } catch {
    return res.status(500).json({ message: "Failed to check favorite" });
  }
};

