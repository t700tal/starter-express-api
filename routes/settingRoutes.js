import express from "express"

import {
  getLastPopup,
  createPopup,
  deletePopup,
  blockDateTime,
  getBlockedDates,
  deleteBlockedDate,
  blockEntireDay,
  blockWeekday,
  sendSMSToAll,
} from "../controllers/settingController.js"
import { protect, admin } from "../middleware/authMiddleware.js"

const router = express.Router()

router
  .route("/popup")
  .get(protect, getLastPopup)
  .post(protect, admin, createPopup)
router.route("/popup/:popupId").delete(protect, admin, deletePopup)
router.route("/blocked-date").get(protect, getBlockedDates)
router.route("/block-datetime").post(protect, admin, blockDateTime)
router.route("/block-day").post(protect, admin, blockEntireDay)
router.route("/block-weekday").post(protect, admin, blockWeekday)
router.route("/sms").post(protect, admin, sendSMSToAll)
router
  .route("/blocked-date/:blockedDateId")
  .delete(protect, admin, deleteBlockedDate)

export default router
