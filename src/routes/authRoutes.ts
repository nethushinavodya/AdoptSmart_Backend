import { Router } from "express"
import {
  getMyProfile,
  handleRefreshToken,
  login,
  registerAdmin,
  registerUser
} from "../controllers/authContoller"
import { authenticate } from "../middlewares/auth"
import { requireRole } from "../middlewares/role"
import { Role } from "../models/userModel"
const router = Router()

// register (only USER) - public
router.post("/register", registerUser)

// login - public
router.post("/login", login)

// register (ADMIN) - Admin only
router.post(
  "/admin/register",
  authenticate,
  requireRole(Role.Admin),
  registerAdmin
)

// refresh token - public
router.post("/refresh-token", handleRefreshToken)
// get my profile - private
router.get("/me", authenticate, getMyProfile)


export default router