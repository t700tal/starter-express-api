import mongoose from "mongoose"

const waitingPatientSchema = mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "יש לספק תאריך רצוי"],
    },
    patient: {
      type: mongoose.Types.ObjectId,
      ref: "Patient",
      required: [true, "יש לציין לקוח"],
    },
  },
  { timestamps: true }
)

const WaitingPatient = mongoose.model("WaitingPatient", waitingPatientSchema)

export default WaitingPatient
