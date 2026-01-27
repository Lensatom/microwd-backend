import { Response } from "express";
import { AuthRequest } from "../../../types/express";
import { Attendance } from "../models/attendance";

export async function getAttendnaceController(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId
    const attendance = await Attendance.find({user_id: userId})
    return res.status(200).json({message: "Attendance data retrieved", attendance})
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve attendance data", error });
  }
}