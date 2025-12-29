import { Request, Response } from "express";
import { verifyAttendance } from "../services/attendanceService";

export function attendanceController(req: Request, res: Response) {
  const { attendanceToken } = req.query as { attendanceToken: string };

  console.log("Attendance token received:", attendanceToken);

  const { isValid } = verifyAttendance(attendanceToken);

  if (!isValid) {
    return res.status(400).json({ message: "Invalid attendance token" });
  }

  res.status(200).json({ message: "Attendance endpoint hit" });
}