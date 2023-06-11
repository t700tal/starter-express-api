import express from "express"

import { loginAdmin, registerAdmin, updateAdmin } from "../controllers/adminController.js"
import { protect, admin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/login").post(loginAdmin)
router.route("/register").post(registerAdmin)
router.route("/update").patch(protect, admin, updateAdmin)

export default router
