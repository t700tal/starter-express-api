import express from "express"

import { loginAdmin, registerAdmin, updateAdmin } from "../controllers/adminController"
import { protect, admin } from "../middleware/authMiddleware"

const router = express.Router()

router.route("/login").post(loginAdmin)
router.route("/register").post(registerAdmin)
router.route("/update").patch(protect, admin, updateAdmin)

export default router
