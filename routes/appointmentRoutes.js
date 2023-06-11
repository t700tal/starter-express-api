import express from "express"

import {
  createAppointment,
  getAvailableTimeSlots,
  getAllApointments,
  getPatientAppointments,
  deleteAppointmentById,
} from "../controllers/appointmentController"
import { protect, patient, admin } from "../middleware/authMiddleware"

const router = express.Router()

router.route("/").get(protect, patient, getPatientAppointments)
router.route("/create").post(protect, createAppointment)
router.route("/available-slots").get(protect, getAvailableTimeSlots)
router.route("/all").get(protect, admin, getAllApointments)
router.route("/:appointmentId").delete(protect, deleteAppointmentById)

export default router
