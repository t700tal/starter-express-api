import moment from "moment"

import Appointment from "../models/Appointment"
import BlockedDate from "../models/blockedDate"

const getAvailableAppointmentsByDate = async (date) => {
  const currentDateTime = moment()
  let startDate

  if (date.isSame(currentDateTime, "day")) {
    startDate = currentDateTime.toDate()
  } else {
    startDate = date.clone().startOf("day").toDate()
  }
  let endOfDay = date.clone().endOf("day").toDate()
  const appointments = await Appointment.find({
    dateTime: {
      $gte: startDate,
      $lt: endOfDay,
    },
    isDone: false,
    isDeleted: false,
  })

  return appointments
}

const getAvailableTimeSlotsByDate = async (date, durationInMinutes) => {
  const blockedDates = await BlockedDate.find({ isDeleted: false })

  const blockedWeeklyDays = blockedDates
    .filter((blockedDate) => blockedDate.isAutomaticWeekly)
    .map((blockedDate) => moment(blockedDate.dateTime).day())

  if (blockedWeeklyDays.includes(moment(date).day())) {
    return []
  }

  const availableAppointments = await getAvailableAppointmentsByDate(date)

  const busyTimeSlots = [...availableAppointments, ...blockedDates]

  const currentDateTime = moment()
  let startWorkingHour
  const todateWorkrTime = moment(currentDateTime).set({
    hour: parseInt(process.env.TIME_OPEN),
    minute: 0,
    second: 0,
  })

  if (
    date.isSame(currentDateTime, "day") &&
    currentDateTime.isAfter(todateWorkrTime)
  ) {
    const spaceTimeInMinutes =
      process.env.SPACE_TIME_IN_MINUTES * 2 -
      (currentDateTime.minute() % process.env.SPACE_TIME_IN_MINUTES)

    startWorkingHour = moment(currentDateTime).add(
      spaceTimeInMinutes,
      "minutes"
    )
  } else {
    startWorkingHour = date.clone().set({
      hour: process.env.TIME_OPEN,
      minute: 0,
      second: 0,
      millisecond: 0,
    })
  }
  const endWorkingHour = date.clone().set({
    hour: process.env.TIME_CLOSE,
    minute: 15,
    second: 0,
    millisecond: 0,
  })
  const appointmentDurations = busyTimeSlots.map((appointment) =>
    moment.duration(appointment.durationInMinutes, "minutes")
  )
  const bookedTimeSlots = busyTimeSlots.map((appointment) =>
    moment(appointment.dateTime)
  )

  let currentTimeSlot = startWorkingHour.clone()
  const availableTimeSlots = []

  while (currentTimeSlot.isBefore(endWorkingHour)) {
    const endTimeSlot = currentTimeSlot
      .clone()
      .add(durationInMinutes, "minutes")

    const isBooked = bookedTimeSlots.some((bookedSlot) => {
      const bookedEndTime = bookedSlot
        .clone()
        .add(
          appointmentDurations[bookedTimeSlots.indexOf(bookedSlot)],
          "minutes"
        )

      return (
        (currentTimeSlot.isSameOrAfter(bookedSlot, "minute") &&
          currentTimeSlot.isBefore(bookedEndTime, "minute")) ||
        (endTimeSlot.isAfter(bookedSlot, "minute") &&
          endTimeSlot.isSameOrBefore(bookedEndTime, "minute"))
      )
    })
    if (!isBooked && endTimeSlot.isBefore(endWorkingHour)) {
      availableTimeSlots.push({
        dateTime: currentTimeSlot.clone(),
      })
    }

    currentTimeSlot.add(process.env.TIME_STEP_IN_MINUTES, "minute")
  }

  return availableTimeSlots
}

const isAvailableTimeSlot = async (timeSlot, durationInMinutes) => {
  const appointments = await getAvailableTimeSlotsByDate(
    timeSlot,
    durationInMinutes
  )
  return (
    appointments.filter(({ dateTime }) => dateTime.isSame(timeSlot, "minute"))
      .length > 0
  )
}

export { getAvailableTimeSlotsByDate, isAvailableTimeSlot }
