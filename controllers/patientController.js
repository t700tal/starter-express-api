import asyncHandler from "express-async-handler"
import fetch from "node-fetch"

import Patient from "../models/Patient"
import { createJWT } from "../utils/jwt"
import mongoose from "mongoose"
import moment from "moment"
import { phoneValidate } from "../utils/validators"
import SmsCode from "../models/smsCode"

// @desc    Login patient & get token
// @route   POST /patient/send-code
const sendSMSCode = asyncHandler(async (req, res) => {
  const { phone: recipient } = req.body

  if (phoneValidate.validator(recipient)) {
    const code = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
    await SmsCode.create({ code, phone: recipient })

    const response = await fetch("https://api.sms4free.co.il/ApiSMS/SendSMS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: process.env.SMS4FREE_KEY,
        user: process.env.SMS4FREE_USER,
        pass: process.env.SMS4FREE_PASS,
        sender: process.env.SMS4FREE_SENDER,
        recipient,
        msg: `הקוד שלך לאפליקציה של אוראל: ${code}`,
      }),
    })
    if (!response.ok || (await responseon()) !== 1) {
      throw new Error("שליחת הודעה נכשלה")
    }
    const patient = await Patient.findOne({ phone: recipient })
    if (!patient) {
      res.status(201)on({ isRegistered: false })
    } else {
      res.status(201)on({ isRegistered: true })
    }
  } else {
    res.status(422)
    throw new Error("מספר נייד לא תקין")
  }
})

// @desc    Login patient & get token
// @route   POST /patient/login
const loginPatient = asyncHandler(async (req, res) => {
  const { fullName, phone, code } = req.body

  const patient = await Patient.findOne({ phone })
  const lastSmsCode = await SmsCode.findOne({ phone }).sort({ createdAt: -1 })
  if (
    !lastSmsCode ||
    moment(lastSmsCode.createdAt).diff(moment(), "minutes") < -5
  ) {
    res.status(401)
    throw new Error("יש לבקש קוד אימות")
  } else if (!(await lastSmsCode.matchCode(code))) {
    res.status(401)
    throw new Error("קוד שגוי")
  } else {
    if (patient) {
      reson({
        token: createJWT({
          patientId: patient._id,
        }),
        canMultipleAppointments: patient.canMultipleAppointments,
        isPermanentBlocked: patient.isPermanentBlocked,
        temporaryBlockedDate: patient.temporaryBlockedDate,
      })
    } else {
      const newPatient = await Patient.create({
        fullName,
        phone,
      })
      res.status(201)on({
        token: createJWT({ patientId: newPatient._id }),
        canMultipleAppointments: patient.canMultipleAppointments,
        isPermanentBlocked: patient.isPermanentBlocked,
        temporaryBlockedDate: patient.temporaryBlockedDate,
      })
    }
  }
})
// @desc    Get patient profile
// @route   POST /patient/profile
const getPatientProfile = asyncHandler(async (req, res) => {
  reson(req.patient)
})

// @desc    Update patient's profile
// @route   PATCH /patient/update
const updatePatient = asyncHandler(async (req, res) => {
  req.patient.fullName = req.body.fullName
  await req.patient.save()

  res.status(204).send()
})

// @desc    Get all patients
// @route   GET /patient/all
const getAllPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find({})
  reson(patients)
})

// @desc    block permanent patient
// @route   PATCH /patient/block-permanent/:patientId
const blockPermanentPatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params
  const { isPermanentBlocked } = req.body

  if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
    res.status(422)
    throw new Error("יש לתת מזהה לקוח תקין")
  }

  const patient = await Patient.findById(patientId)

  if (!patient) {
    res.status(404)
    throw new Error("לא נמצא לקוח")
  }

  patient.isPermanentBlocked = isPermanentBlocked
  await patient.save()

  res.status(204).send()
})

// @desc    block / unblock permanent patient
// @route   PATCH /patient/block-temporary/:patientId
const blockTemporaryPatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params
  const { dateTime } = req.body

  if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
    res.status(422)
    throw new Error("יש לתת מזהה לקוח תקין")
  }

  const patient = await Patient.findById(patientId)

  if (!patient) {
    res.status(404)
    throw new Error("לא נמצא לקוח")
  }

  if (!dateTime) {
    patient.temporaryBlockedDate = null
  } else {
    patient.temporaryBlockedDate = moment(dateTime)
  }

  await patient.save()

  res.status(204).send()
})

// @desc    Update patient's permission to have multiple appointments
// @route   PATCH /patient/multiple-appointments/:patientId
const multipleAppointmentPermission = asyncHandler(async (req, res) => {
  const { patientId } = req.params
  const { canMultipleAppointments } = req.body

  if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
    res.status(422)
    throw new Error("יש לתת מזהה לקוח תקין")
  }

  const patient = await Patient.findById(patientId)

  if (!patient) {
    res.status(404)
    throw new Error("לא נמצא לקוח")
  }

  patient.canMultipleAppointments = canMultipleAppointments
  await patient.save()

  res.status(204).send()
})

export {
  sendSMSCode,
  loginPatient,
  updatePatient,
  getAllPatients,
  blockPermanentPatient,
  blockTemporaryPatient,
  multipleAppointmentPermission,
  getPatientProfile,
}
