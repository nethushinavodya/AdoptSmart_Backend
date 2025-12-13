import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User, Role } from "../models/userModel";
import { signAccessToken, signRefreshToken } from "../utils/token";
import { AuthRequest } from "../middlewares/auth";
import jwt from "jsonwebtoken";

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string
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

// ------------------ LOGIN ------------------
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, existingUser.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = signAccessToken(existingUser);
    const refreshToken = signRefreshToken(existingUser) // this

    res.status(200).json({
      message: "Login successful",
      data: {
        id: existingUser._id,
        email: existingUser.email,
        username: existingUser.username,
        role: existingUser.role,
        accessToken,
        refreshToken
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ REGISTER ADMIN ------------------
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { _id, username, email, password, contactNumber, location } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      _id,
      username,
      email,
      password: hashedPassword,
      contactNumber,
      location,
      role: [Role.Admin],
    });

    res.status(201).json({
      message: "Admin registered successfully",
      data: {
        id: admin._id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ GET MY PROFILE ------------------
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.sub).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ HANDLE REFRESH TOKEN ------------------
export const handleRefreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body
    if (!token) {
      return res.status(400).json({ message: "Token required" })
    }
    // import jwt from "jsonwebtoken"
    const payload = jwt.verify(token, JWT_REFRESH_SECRET)
    // payload.sub - userID
    const user = await User.findById(payload.sub)
    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" })
    }
    const accessToken = signAccessToken(user)
    res.status(200).json({ accessToken })
  } catch (err) {
    res.status(403).json({ message: "Invalid or expire token" })
  }
}