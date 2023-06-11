import asyncHandler from "express-async-handler"
import Appointment from "../models/Appointment.js"
import Patient from "../models/patient.js" 
import moment from "moment"
import {
  getAvailableTimeSlotsByDate,
  isAvailableTimeSlot,
} from "../utils/appointments.js"
import mongoose from "mongoose"

// @desc    Set new appointment by date
// @route   POST /appointment/create
const createAppointment = asyncHandler(async (req, res) => {
  let { dateTime: requestedDateTime, durationInMinutes, patientId } = req.body
  const dateTime = moment(requestedDateTime)
  const isAdmin = req.admin
  durationInMinutes = parseInt(durationInMinutes)
  if (
    !requestedDateTime ||
    !durationInMinutes ||
    !/^\d+$/.test(durationInMinutes + "") ||
    !dateTime.isValid() ||
    dateTime.isBefore(moment(), "day")
  ) {
    res.status(422)
    throw new Error("יש לתת משך פגישה וגם תאריך תקינים")
  }

  const isAvailable = await isAvailableTimeSlot(dateTime, durationInMinutes)

  let newAppointment

  if (!isAvailable) {
    res.status(409)
    throw new Error("זמן הפגישה אינו זמין")
  } else {
    if (isAdmin) {
      const patient = await Patient.findById(patientId)
      if (!patient) {
        res.status(404)
        throw new Error("לא נמצא מטופל")
      }
      newAppointment = await Appointment.create({
        dateTime,
        durationInMinutes,
        patient: patientId,
      })
    } else {
      newAppointment = await Appointment.create({
        dateTime,
        // In future, patients will be able to choose the duration of the appointment
        durationInMinutes: process.env.DEFAULT_APPOINTMENT_DURATION,
        patient: req.patient._id,
      })
    }
  }

  res.json(newAppointment)
})

// @desc    Get available time slots to set appointments
// @route   GET /appointment/available-slots?date=YYYY-MM-DD&durationInMinutes=X
const getAvailableTimeSlots = asyncHandler(async (req, res) => {
  let { date: requestedDate, durationInMinutes } = req.query
  const date = moment(requestedDate)
  durationInMinutes = parseInt(durationInMinutes)

  if (
    !requestedDate ||
    !durationInMinutes ||
    !/^\d+$/.test(durationInMinutes + "") ||
    !date.isValid() ||
    date.isBefore(moment(), "day")
  ) {
    res.status(422)
    throw new Error("יש לתת משך פגישה וגם תאריך תקינים")
  }

  const availableSlots = await getAvailableTimeSlotsByDate(
    date,
    durationInMinutes
  )
  res.json(availableSlots)
})

// @desc    Get all appointments
// @route   GET /appointment/all
const getAllApointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({
    isDeleted: false,
    isDone: false,
  })
  res.json(appointments)
})

// @desc    Get all appointments for existing patient
// @route   GET /appointment/
const getPatientAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({
    patient: req.patient._id,
    isDeleted: false,
    isDone: false,
  })
  res.json(appointments)
})

// @desc    Mark an appointment as deleted by id
// @route   DELETE /appointment/:appointmentId
const deleteAppointmentById = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params
  const isAdmin = req.admin

  if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
    res.status(422)
    throw new Error("יש לתת מזהה פגישה תקין")
  }

  const appointment = await Appointment.findById(appointmentId)
  if (
    !appointment ||
    (!isAdmin && appointment.patient.toString() !== req.patient._id.toString())
  ) {
    res.status(404)
    throw new Error("פגישה לא קיימת")
  }
  appointment.isDeleted = true

  await appointment.save()
  res.status(204).send()
})

export {
  createAppointment,
  getAvailableTimeSlots,
  getAllApointments,
  getPatientAppointments,
  deleteAppointmentById,
}
