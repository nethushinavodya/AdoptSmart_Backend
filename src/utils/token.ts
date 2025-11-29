import { IUser } from "../models/userModel"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET as string

export const signAccessToken = (user: IUser): string => {
  return jwt.sign({ sub: user._id, roles: user.role }, JWT_SECRET, {
    expiresIn: "30m"
  })
}

console.log(process.env.JWT_SECRET)