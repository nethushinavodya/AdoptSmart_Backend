import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User, Role } from "../models/userModel";
import { signAccessToken } from "../utils/token";
import { AuthRequest } from "../middlewares/auth";

// ------------------ REGISTER USER ------------------
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { _id, username, email, password, contactNumber, location, profilePicture } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      _id,
      username,
      email,
      password: hashedPassword,
      contactNumber,
      location,
      profilePicture: null,
      role: [Role.User],
    });

    res.status(201).json({
      message: "User registered successfully",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

