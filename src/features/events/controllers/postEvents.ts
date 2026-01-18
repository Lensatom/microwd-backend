import { Request, Response } from "express";
import { Event } from "../models/event";

export async function postEventsController(req: Request, res: Response) {
  const requiredFields = ['name', 'date', 'location', 'description'];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ message: `Missing required field: ${field}` });
    }
  }

  const newEvent = {
    name: req.body.name,
    date: req.body.date,
    location: req.body.location,
    description: req.body.description,
    additionalInfo: req.body.additionalInfo || [],
  }

  await Event.create(newEvent);

  return res.status(200).json({ message: "Post events endpoint hit" });
}