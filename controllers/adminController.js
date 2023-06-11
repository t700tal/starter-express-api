import asyncHandler from "express-async-handler"

import Admin from "../models/admin.js"
import { createJWT } from "../utils/jwt.js"

// @desc    Login CRM admin & get token
// @route   POST /admin/login
const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body

  const admin = await Admin.findOne({ username }).select("+password")

  if (admin && (await admin.matchPassword(password))) {
    if (!admin.hasApproved) {
      res.status(403)
      throw new Error("יש לחכות לאישור של מנהל")
    } else {
      res.json({ token: createJWT({ adminId: admin._id }) })
    }
  } else {
    res.status(401)
    throw new Error("שם משתמש או סיסמה שגויים")
  }
})

// @desc    Register CRM admin  & get token
// @route   POST /admin/register
const registerAdmin = asyncHandler(async (req, res) => {
  const { fullName, username, password } = req.body

  const adminExists = await Admin.findOne({ username })

  if (adminExists) {
    res.status(409)
    throw new Error("שם המשתמש כבר קיים במערכת.")
  } else {
    const admin = await Admin.create({
      fullName,
      username,
      password,
    })

    res.status(201).send()
  }
})

// @desc    Update CRM admin's profile
// @route   PATCH /admin/update
const updateAdmin = asyncHandler(async (req, res) => {
  const { fullName, password } = req.body

  if (!fullName && !password) {
    res.status(422)
    throw new Error("יש למלא שדה אחד לפחות")
  } else {
    const admin = req.admin

    admin.fullName = req.body.fullName || admin.fullName
    if (req.body.password) {
      admin.password = req.body.password
    }

    await admin.save()

    res.status(204).send()
  }
})

export { loginAdmin, registerAdmin, updateAdmin }
