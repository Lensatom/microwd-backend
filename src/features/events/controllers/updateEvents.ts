import { Response } from "express";
import { AuthRequest } from "../../../types/express";
import { Event } from "../models/event";

export async function updateEventByIdController(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const eventId = req.params.id;
    const data = req.body;

    if (!data.isDeleted) {
      return res.status(400).json({ message: "isDeleted field is required to update event" });
    }

    const event = await Event.findById(eventId)

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.user_id !== userId) {
      return res.status(401).json({ message: "You do not have the permission to update this event" });
    }
  
    await Event.updateOne({ _id: eventId, user_id: userId }, { isDeleted: true });
  
    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
}