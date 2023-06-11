import express from "express"
import dotenv from "dotenv"
import helmet from "helmet"
import morgan from "morgan"
import cors from "cors"
import xss from "xss-clean"
import hpp from "hpp"
import mongoSanitize from "express-mongo-sanitize"
import moment from "moment-timezone"

import connectDB from "./config/db"
import { errorHandler, notFound } from "./middleware/errorMiddleware"
import { rateLimitter } from "./middleware/rateLimitMiddleware"
import adminRouter from "./routes/adminRoutes"
import patientRouter from "./routes/patientRoutes"
import appointmentRouter from "./routes/appointmentRoutes"
import sesttingRouter from "./routes/settingRoutes"

dotenv.config()

connectDB()

moment.tz.setDefault("Israel")

const app = express()

if (process.env.NODE_ENV.toLowerCase() === "development") {
  app.use(morgan("dev"))
} else {
  app.use(morgan("combined"))
  app.use(rateLimitter)
}
app.use(cors({ origin: "*" }))
app.use(expresson())
app.use(hpp())
app.use(helmet())
app.use(xss())
app.use(mongoSanitize())

app.use("/admin", adminRouter)
app.use("/patient", patientRouter)
app.use("/appointment", appointmentRouter)
app.use("/setting", sesttingRouter)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)

// #TODO: blockdays, working times, waitings.
// Validators for all columns in all models (even moments).
// check that findByIdAndUpdate is good for me and change all to: findByIdAndUpdate.
// be consistent on things like the end points name /create, /blockedDate
// check where can i change const to let when take req.params/req.body/req.query
// think what to do with the duplpications in blocked dates as admin.
// start and  end time are 3 hours before .
// check that all get data are sorted by date.
// organize auth middleware
// node jobs, and firebase.
// To sosrt all things that sent to frontend
//change here and in frontend patient -> patientId
// rate limit in sms sending and block user if too much attempts
// in baakend: blocked patients canat set appointments.
// remove comments from sendSMSCode() and logs
// loading when set appointment so u blocok the button
// validate time diff 
// if patient set new appointment it will be 15 mins anaayway so why i validate it with its given duration.
// check if appointment or any deletable obj is already deleted
// handle appointment deletion and dont allow to delete 30 mins before
// show deleted appointments
// auto delete schedule everyting.
// description screenshots and app icon smaller
// donit allow to spam the sms code.
// app :------------------------
// remove auto splash screen in apple
// web and app icon
