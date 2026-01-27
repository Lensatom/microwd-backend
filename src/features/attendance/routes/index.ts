import { Router } from "express";
import { getAttendanceHistoryController } from "../controllers/readAttendance";

const attendanceRouter = Router();

attendanceRouter.get("/history", getAttendanceHistoryController)

export default attendanceRouter;