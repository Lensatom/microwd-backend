import { Response } from "express";
import { Event } from "../models/event";
import { AuthRequest } from "../../../types/express";

export const deleteEventByIdController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const eventId = req.params.id;
    const event = await Event.findById(eventId)

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.user_id !== userId) {
      return res.status(401).json({ message: "You do not have permission to delete this event" });
    }
    
    await Event.deleteOne({ _id: eventId, user_id: userId });
  
    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
}