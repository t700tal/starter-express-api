import mongoose from "mongoose"
import bcrypt from "bcryptjs"

import {
  fullNameValidate,
  usernameValidate,
  passwordValidate,
} from "../utils/validators"

const adminSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      validate: fullNameValidate,
      required: [true, "יש להזין שם מלא"],
    },
    username: {
      type: String,
      validate: usernameValidate,
      required: [true, "יש להזין שם משתמש"],
      trim: true,
    },
    password: {
      type: String,
      validate: passwordValidate,
      required: [true, "יש להזין סיסמה"],
      select: false,
      trim: true,
    },
    hasApproved: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

const Admin = mongoose.model("Admin", adminSchema)

export default Admin
