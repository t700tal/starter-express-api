import mongoose from "mongoose"

const blockedDateSchema = mongoose.Schema(
  {
    dateTime: {
      type: Date,
      required: [true, "יש לספק את תארי וזמן החסימה"],
    },
    durationInMinutes: {
      type: Number,
      min: 5,
      required: [true, "יש לציין את משך החסימה מינימום 5 דקות"],
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    isAutomaticWeekly: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
)

const BlockedDate = mongoose.model("BlockedDate", blockedDateSchema)

export default BlockedDate
