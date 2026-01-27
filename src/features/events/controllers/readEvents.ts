import { Response } from "express";
import { AuthRequest } from "../../../types/express";
import { Attendance } from "../../attendance/models/attendance";
import { Event } from "../models/event";

export async function getEventByIdController(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = req.userId;

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }
  
  const hasFilled = await Attendance.exists({ user_id: userId, event_id: id });

  const responseData = {
    ...event.toObject(),
    hasFilled: !!hasFilled
  }

  return res.status(200).json({ message: "retrieved event", event: responseData });
}



export async function getUserEventsController(req: AuthRequest, res: Response) {
  const userId = req.userId;
  const events = await Event.find({ user_id: userId });
  return res.status(200).json({ message: "retrieved events", events });
}


export async function getAllRecordedAttendanceController(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const eventId = req.params;

    const attendances = await Attendance.find({ user_id: userId, event_id: eventId });

    return res.status(200).json({ message: "retrieved attendances", attendances });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}