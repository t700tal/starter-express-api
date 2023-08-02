import asyncHandler from "express-async-handler"
import fetch from "node-fetch"

import Popup from "../models/popup.js"
import BlockedDate from "../models/blockedDate.js"
import mongoose from "mongoose"
import moment from "moment"

import Patient from "../models/patient.js"

// @desc    Block a date for appointments
// @route   POST /setting/blocked-date
const blockDateTime = asyncHandler(async (req, res) => {
  const { dateTime: requestedDateTime, durationInMinutes } = req.body
  const dateTime = moment(requestedDateTime)

  if (
    !requestedDateTime ||
    !durationInMinutes ||
    !dateTime.isValid() ||
    dateTime.isBefore(moment(), "day")
  ) {
    res.status(422)
    throw new Error("יש לתת משך פגישה וגם תאריך תקינים")
  }
  const blockedDate = await BlockedDate.create({
    dateTime,
    durationInMinutes,
  })

  res.json(blockedDate)
})

// @desc    Block an entire day for appointments
// @route   POST /setting/blocked-day
const blockEntireDay = asyncHandler(async (req, res) => {
  const { date: requestedDate } = req.body
  const date = moment(requestedDate)

  if (!requestedDate || !date.isValid() || date.isBefore(moment(), "day")) {
    res.status(422)
    throw new Error("יש לתת תאריך תקין")
  }
  const blockedDate = await BlockedDate.create({
    dateTime: date.startOf("day"),
    durationInMinutes: 1440, // 24 Hours
  })

  res.json(blockedDate)
})

// @desc    Block a weekday day for appointments
// @route   POST /setting/block-weekday
const blockWeekday = asyncHandler(async (req, res) => {
  let { day } = req.body

  day = parseInt(day)

  if ((day !== 0 && !day) || day > 6 || day < 0) {
    res.status(422)
    throw new Error("יש לתת יום תקין כמספר")
  }

  const blockedDate = await BlockedDate.create({
    dateTime: moment().day(day),
    durationInMinutes: 1440, // 24 Hours
    isAutomaticWeekly: true,
  })

  res.json(blockedDate)
})

// @desc    Get all the dates that are blocked
// @route   GET /setting/blocked-date
const getBlockedDates = asyncHandler(async (req, res) => {
  const blockDates = await BlockedDate.find({ isDeleted: false })
  res.json(blockDates)
})

// @desc    Delete a date that is blocked
// @route   DELETE /setting/blocked-date/:blockedDateId
const deleteBlockedDate = asyncHandler(async (req, res) => {
  const { blockedDateId } = req.params
  if (!blockedDateId || !mongoose.Types.ObjectId.isValid(blockedDateId)) {
    res.status(422)
    throw new Error("יש לתת מזהה תאריך חסום תקין")
  }
  const blockedDate = await BlockedDate.findOne({
    _id: blockedDateId,
    isDeleted: false,
  })
  if (!blockedDate) {
    res.status(404)
    throw new Error("תאריך חסום לא קיים")
  }
  blockedDate.isDeleted = true
  await blockedDate.save()
  res.status(204).send()
})

// @desc    Create a popup
// @route   POST /setting/popup
const createPopup = asyncHandler(async (req, res) => {
  const { text } = req.body
  const oldPopup = await Popup.findOne({ isDeleted: false }).sort({
    createdAt: -1,
  })
  if (oldPopup) {
    oldPopup.isDeleted = true
    await oldPopup.save()
  }
  const popup = await Popup.create({ text })
  res.status(201).json(popup)
})

// @desc    Get the latest popup
// @route   GET /setting/popup
const getLastPopup = asyncHandler(async (req, res) => {
  const popup = await Popup.findOne({ isDeleted: false }).sort({
    createdAt: -1,
  })
  res.json(popup)
})

// @desc    Delete a popup
// @route   DELETE /setting/popup/:popupId
const deletePopup = asyncHandler(async (req, res) => {
  const { popupId } = req.params
  if (!popupId || !mongoose.Types.ObjectId.isValid(popupId)) {
    res.status(422)
    throw new Error("יש לתת מזהה מודעה תקין")
  }
  const popup = await Popup.findOne({ _id: popupId, isDeleted: false })
  if (!popup) {
    res.status(404)
    throw new Error("מודעה לא קיימת")
  }
  popup.isDeleted = true
  await popup.save()
  res.status(204).send()
})

// @desc    Send SMS to all patients
// @route   POST /setting/sms
const sendSMSToAll = asyncHandler(async (req, res) => {
  const { message } = req.body
  if (!message) {
    res.status(422)
    throw new Error("יש לתת הודעה")
  }
  const patients = await Patient.find({ })
  for (const singlePatient of patients) {
    try {
      const response = await fetch(
        "https://api.sms4free.co.il/ApiSMS/SendSMS",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: process.env.SMS4FREE_KEY,
            user: process.env.SMS4FREE_USER,
            pass: process.env.SMS4FREE_PASS,
            sender: process.env.SMS4FREE_SENDER,
            recipient: singlePatient.phone,
            msg: message,
          }),
        }
      )
      if (!response.ok || (await response.json()) !== 1) {
        console.log(await response.json())
        return res.status(500).send()
      }
    } catch (err) {
      console.log(err)
      return res.status(500).send()
    }
  }
  res.status(204).send()
})

export {
  createPopup,
  getLastPopup,
  deletePopup,
  blockDateTime,
  blockEntireDay,
  blockWeekday,
  getBlockedDates,
  deleteBlockedDate,
  sendSMSToAll,
}
