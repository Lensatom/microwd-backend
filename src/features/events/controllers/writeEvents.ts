import { Request, Response } from "express";
import { Event } from "../models/event";
import { AuthRequest } from "../../../types/express";

export async function postEventsController(req: AuthRequest, res: Response) {
  const body = req.body;
  const requiredFields = ['name', 'date', 'location', 'description'];

  for (const field of requiredFields) {
    if (!body[field]) {
      return res.status(400).json({ message: `Missing required field: ${field}` });
    }
  }

  const newEvent = {
    name: body.name,
    date: body.date,
    location: body.location,
    description: body.description,
    additionalInfoFields: body.additionalInfoFields || [],
    user_id: req.userId,
  }

  await Event.create(newEvent);

  return res.status(200).json({ message: "Post events endpoint hit" });
}