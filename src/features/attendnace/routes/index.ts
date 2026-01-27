import { Router } from "express";
import { getAttendnaceController } from "../controllers/readAttendance";

const attendanceRouter = Router();

attendanceRouter.get("/", getAttendnaceController)

export default attendanceRouter;