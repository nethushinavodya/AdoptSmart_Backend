import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { SuccessStory } from "../models/succesStoriesModel";
import cloudinary from "../config/cloudinary";

export const createSuccessStory = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description } = req.body;

        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            return res.status(400).json({ message: "At least 1 image is required" });
        }

        const files = req.files as Express.Multer.File[];

        if (files.length > 4) {
            return res.status(400).json({ message: "Maximum 4 images allowed" });
        }

        const imageUrls: string[] = [];

        for (const file of files) {
            const base64Image = `data:${file.mimetype};base64,${file.buffer.toString(
                "base64"
            )}`;

            const result = await cloudinary.uploader.upload(base64Image, {
                folder: "success_stories",
            });

            imageUrls.push(result.secure_url);
        }

        const successStory = await SuccessStory.create({
            userId: req.user.sub,
            title,
            description,
            images: imageUrls,
        });

        res.status(201).json(successStory);
    } catch (error) {
        res.status(500).json({ message: "Failed to create success story", error });
    }
};

export const getAllSuccessStories = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const stories = await SuccessStory.find()
            .populate("userId", "username email profilePicture")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await SuccessStory.countDocuments();

        res.status(200).json({
            message: "All success stories",
            data: stories,
            totalPages: Math.ceil(total / limit),
            totalCount: total,
            page,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch success stories", error });
    }
};

export const getMySuccessStories = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const stories = await SuccessStory.find({ userId: req.user.sub })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await SuccessStory.countDocuments({ userId: req.user.sub });

        res.status(200).json({
            message: "My success stories",
            data: stories,
            totalPages: Math.ceil(total / limit),
            totalCount: total,
            page,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch my success stories", error });
    }
};

export const deleteSuccessStory = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("params", req.params);
    try {
        const { id } = req.params;
        const story = await SuccessStory.findById(id);

        console.log("story", story);
        if (!story) {
            return res.status(404).json({ message: "Success story not found" });
        }
        // Ensure only owner can delete
        if (story.userId.toString() !== req.user.sub) {
            return res.status(403).json({ message: "Not allowed to delete this story" });
        }
        await SuccessStory.findByIdAndDelete(id);

        res.status(200).json({ message: "Success story deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete success story", error });
    }
};
