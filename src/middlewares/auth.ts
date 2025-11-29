import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request {
  user?: any; // you can type it more strictly if you want
}

// ------------------ JWT AUTHENTICATION ------------------
export const authenticate = (
  req: AuthRequest,// here we use AuthRequest to add user property to request object without using Request interface 
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // No token provided → stop here
    return res.status(401).json({ message: "No token provided" });
  }

  // Format: "Bearer <token>"
  const token = authHeader.split(" ")[1]; // ["Bearer", "<token>"]

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    // Verify token
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // attach payload to request
    next(); // continue to next middleware/controller
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default authenticate;