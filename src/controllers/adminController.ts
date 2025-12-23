import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { Pet } from "../models/PetPostModel";

export const getAllPendingPetPosts = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { postStatus: "Pending" as const };

    const posts = await Pet.find(filter)
      .populate("ownerId", "username email profilePicture contactNumber location")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Pet.countDocuments(filter);

    return res.status(200).json({
      message: "Pending pet posts",
      data: posts,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      page,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch pending pet posts" });
  }
};

export const approvePetPost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const post = await Pet.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Pet post not found" });
    }

    if (post.postStatus === "Approved") {
      return res.status(200).json({
        message: "Pet post already approved",
        data: post,
      });
    }

    post.postStatus = "Approved";
    await post.save();

    const populated = await Pet.findById(post._id).populate(
      "ownerId",
      "username email profilePicture contactNumber location"
    );

    return res.status(200).json({
      message: "Pet post approved",
      data: populated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to approve pet post" });
  }
};

