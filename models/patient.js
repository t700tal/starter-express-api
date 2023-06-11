import mongoose from "mongoose"

import { fullNameValidate, phoneValidate } from "../utils/validators.js"

const patientSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      validate: fullNameValidate,
      required: [true, "יש למלא שם מלא"],
    },
    phone: {
      type: String,
      validate: phoneValidate,
      required: [true, "יש למלא מספר טלפון"],
    },
    canMultipleAppointments: {
      type: Boolean,
      required: true,
      default: false,
    },
    temporaryBlockedDate: {
      type: Date,
    },
    isPermanentBlocked: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

const Patient = mongoose.model("Patient", patientSchema)

export default Patient
