import jwt from "jsonwebtoken"
import asyncHandler from "express-async-handler"

import Admin from "../models/admin"
import Patient from "../models/Patient"

const protect = asyncHandler(async (req, res, next) => {
  try {
    const authorization = req.headers.authorization
    if (authorization && authorization.startsWith("Bearer")) {
      const token = authorization.split(" ")[1]

      const { adminId, patientId } = jwt.verify(token, process.env.JWT_SECRET)
      if (patientId) {
        const patient = await Patient.findById(patientId)
        if (!patient) {
          res.status(403)
          throw new Error("יש להתחבר על מנת לקבל גישה")
        }
        req.patient = patient
        return next()
        return next()
      } else if (adminId) {
        const admin = await Admin.findById(adminId)
        if (!admin) {
          res.status(403)
          throw new Error("יש להתחבר על מנת לקבל גישה")
        }
        req.admin = admin
        return next()
      }
    }
    throw new Error("")
  } catch (error) {
    res.status(403)
    throw new Error("יש להתחבר על מנת לקבל גישה")
  }
})

const patient = (req, res, next) => {
  if (req.patient) {
    next()
  } else {
    res.status(401)
    throw new Error("אין לך הרשאה למשאב זה")
  }
}

const admin = (req, res, next) => {
  if (req.admin && req.admin.hasApproved) {
    next()
  } else {
    res.status(401)
    throw new Error("אין הרשאה למשאב זה")
  }
}

export { protect, patient, admin }
