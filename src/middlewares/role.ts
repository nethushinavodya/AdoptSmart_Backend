import { NextFunction, Response } from "express"
import { Role } from "../models/userModel"
import { AuthRequest } from "./auth"

export const requireRole = (role: Role) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }
    if (!req.user.roles?.includes(role)) {
      return res.status(403).json({
        message: `Require ${role} role`
      })
    }
    next()
  }
}
// [].includes