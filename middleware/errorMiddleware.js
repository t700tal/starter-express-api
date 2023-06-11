import mongoose from "mongoose"

// @desc    Handle not found routes.
const notFound = (req, res, next) => {
  const error = new Error(`לא נמצא - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

// @desc    Handle errors (Mongoose validation errors and general errors).
const errorHandler = (err, req, res, next) => {
  const errorStack = process.env.NODE_ENV === "production" ? null : err.stack
  if (err instanceof mongoose.Error && err.errors) {
    const validationErrorsValues = Object.values(err.errors)
    const errorMessages = validationErrorsValues.map((error) => error.message)

    res.status(422)on({
      message: errorMessages.length > 1 ? errorMessages.join(", ") : errorMessages[0],
      stack: errorStack,
    })
  } else {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    res.status(statusCode)
    reson({
      message: err.message,
      stack: errorStack,
    })
  }
}

export { notFound, errorHandler }
