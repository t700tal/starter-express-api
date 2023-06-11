import asyncHandler from "express-async-handler"

import Popup from "../models/popup"
import BlockedDate from "../models/blockedDate"
import mongoose from "mongoose"
import moment from "moment"

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

  reson(blockedDate)
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

  reson(blockedDate)
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

  reson(blockedDate)
})

// @desc    Get all the dates that are blocked
// @route   GET /setting/blocked-date
const getBlockedDates = asyncHandler(async (req, res) => {
  const blockDates = await BlockedDate.find({ isDeleted: false })
  reson(blockDates)
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
  res.status(201)on(popup)
})

// @desc    Get the latest popup
// @route   GET /setting/popup
const getLastPopup = asyncHandler(async (req, res) => {
  const popup = await Popup.findOne({ isDeleted: false }).sort({
    createdAt: -1,
  })
  reson(popup)
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

export {
  createPopup,
  getLastPopup,
  deletePopup,
  blockDateTime,
  blockEntireDay,
  blockWeekday,
  getBlockedDates,
  deleteBlockedDate,
}
