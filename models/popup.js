import mongoose from "mongoose"

import { popupValidate } from "../utils/validators.js"

const popupSchema = mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      validate: popupValidate,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
)

const Popup = mongoose.model("Popup", popupSchema)

export default Popup
