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

export const getMyPets = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const pets = await Pet.find({ ownerId: req.user.sub })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Pet.countDocuments({ ownerId: req.user.sub });

    res.status(200).json({
      message: "My pet posts",
      data: pets,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      page,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch my pet posts" });
  }
};

export const updatePetPost = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const pet = await Pet.findById(id);

    if (!pet) return res.status(404).json({ message: "Pet not found" });

    // Ensure only owner can update
    if (pet.ownerId.toString() !== req.user.sub) {
      return res.status(403).json({ message: "Not allowed to update this post" });
    }

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
      status,
    } = req.body;

    // Optional image update
    if (req.file) {
      console.log(req.file);
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
      pet.imageUrl = result.secure_url;
    }

    // Update other fields
    pet.name = name || pet.name;
    pet.species = species || pet.species;
    pet.breed = breed || pet.breed;
    pet.age = age || pet.age;
    pet.gender = gender || pet.gender;
    pet.description = description || pet.description;
    pet.adoptionType = adoptionType || pet.adoptionType;
    pet.price = adoptionType === "Paid" ? price : undefined;
    pet.contactInfo = contactInfo || pet.contactInfo;
    pet.location = location || pet.location;
    pet.status = status || pet.status;

    await pet.save();

    res.status(200).json({ message: "Pet post updated successfully", data: pet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update pet post" });
  }
};

