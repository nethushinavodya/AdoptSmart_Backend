import { Response } from "express";
import cloudinary from "../config/cloudinary";
import { Pet } from "../models/PetPostModel";
import { AuthRequest } from "../middlewares/auth";

export const savePetPost = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const {
      name,
      species,
      breed,
      age,
      gender,
      description,
      adoptionType,
      price,
      contactInfo,
      location,
    } = req.body;

    let imageUrl = "";

    if (req.file) {
      console.log("File exists");
      const buffer = req.file.buffer;
      const result: any = await new Promise((resolve, reject) => {
        const upload_stream = cloudinary.uploader.upload_stream(
          { folder: "pets" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        upload_stream.end(buffer);
      });
      imageUrl = result.secure_url;
    }

    const newPet = new Pet({
      ownerId: req.user.sub,
      name,
      species,
      breed,
      age,
      gender,
      description,
      adoptionType,
      price: adoptionType === "Paid" ? price : undefined,
      contactInfo,
      imageUrl,
      location,
      status: "Available",
    });

    await newPet.save();

    res.status(201).json({ message: "Pet post created successfully", data: newPet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create pet post" });
  }
};

export const getAllPets = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const pets = await Pet.find()
        .populate("ownerId", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Pet.countDocuments();

    res.status(200).json({
      message: "All pet posts",
      data: pets,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      page,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch pet posts" });
  }
};

