import { Request, Response } from "express";
import { AuthRequest } from "../../../types/express";
import { Attendance } from "../models/attendance";
import { Event } from "../models/event";

export async function getEventByIdController(req: Request, res: Response) {
  const { id } = req.params;

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  return res.status(200).json({ message: "retrieved event", event });
}



export async function getUserEventsController(req: AuthRequest, res: Response) {
  const id = req.userId;
  const events = await Event.find({ user_id: id });
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