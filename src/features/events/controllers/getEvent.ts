import { Request, Response } from "express";
import { Event } from "../models/event";
import { AuthRequest } from "../../../types/express";

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