import mongoose from "mongoose"
import moment from "moment"

import {
  fullNameValidate,
  usernameValidate,
  passwordValidate,
} from "../utils/validators"

const appointmentSchema = mongoose.Schema(
  {
    dateTime: {
      type: Date,
      required: [true, "יש לספק תאריך ושעה לתור"],
      // get: (v) => moment(v),
      // set: (v) => moment(v).toDate(),
    },
    durationInMinutes: {
      type: Number,
      default: 15,
    },
    patient: {
      type: mongoose.Types.ObjectId,
      ref: "Patient",
      required: [true, "יש לציין לקוח"],
    },
    isDone: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
)

const Appointment = mongoose.model("Appointment", appointmentSchema)

export default Appointment
