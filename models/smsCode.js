import mongoose from "mongoose"
import bcrypt from "bcryptjs"

import { phoneValidate } from "../utils/validators.js"

const smsCodeSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "יש לציין קוד"],
    },
    phone: {
      type: String,
      validate: phoneValidate,
      required: [true, "יש למלא מספר טלפון"],
    },
  },
  { timestamps: true }
)

smsCodeSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10)
  this.code = await bcrypt.hash(this.code, salt)
})

smsCodeSchema.methods.matchCode = async function (enteredCode) {
  return await bcrypt.compare(enteredCode, this.code)
}

const SmsCodeSchema = mongoose.model("SmsCodeSchema", smsCodeSchema)

export default SmsCodeSchema
