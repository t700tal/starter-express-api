import express from "express"

import {
  sendSMSCode,
  loginPatient,
  updatePatient,
  getAllPatients,
  blockPermanentPatient,
  blockTemporaryPatient,
  multipleAppointmentPermission,
  getPatientProfile,
} from "../controllers/patientController.js"
import { protect, patient, admin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/send-code").post(sendSMSCode)
router.route("/login").post(loginPatient)
router.route("/profile").get(protect, patient,  getPatientProfile)
router.route("/all").get(protect, admin, getAllPatients)
router.route("/update").patch(protect, patient, updatePatient)
router.route("/block-permanent/:patientId").patch(protect, admin, blockPermanentPatient)
router.route("/block-temporary/:patientId").patch(protect, admin, blockTemporaryPatient)
router.route("/multiple-appointments/:patientId").patch(protect, admin, multipleAppointmentPermission)
router
  .route("/waiting")
  .post(protect, patient, () => {})
  .delete(protect, patient, () => {})
  .get(protect, admin, () => {})

export default router
