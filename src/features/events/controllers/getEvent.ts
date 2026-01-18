import { Request, Response } from "express";

export async function getEventByIdController(req: Request, res: Response) {
  const { id } = req.params;

  if (id === "1") {
    return res.status(200).json({ id: "1", name: "Sample Event", date: "2024-01-01" });
  } else {
    return res.status(404).json({ message: "Event not found" });
  }
}

export async function getUserEventsController(req: Request, res: Response) {
  const { id } = req.params;

  if (id === "1") {
    return res.status(200).json({ id: "1", name: "Sample Event", date: "2024-01-01" });
  } else {
    return res.status(404).json({ message: "Event not found" });
  }
}