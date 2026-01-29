import { Response } from "express";
import { AuthRequest } from "../../../types/express";
import { Attendance } from "../../attendance/models/attendance";
import { Event } from "../models/event";
import PDFDocument from 'pdfkit';

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


export async function getEventAttendanceListController(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { id: eventId } = req.params;

    const attendances = await Attendance.find({ user_id: userId, event_id: eventId });

    return res.status(200).json({ message: "retrieved attendances", data: attendances });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Server error" });
  }
}



export async function getEventAttendanceListPdfController(req: AuthRequest, res: Response) {
  try {
    res.status(200);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="attendance.pdf"');

    const doc = new PDFDocument({ margin: 30 });

    doc.on('error', () => {
      if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to generate PDF' });
      } else {
        res.end();
      }
    });

    doc.pipe(res);

    doc.fontSize(20).text('Attendance List', { align: 'left' });
    doc.moveDown();
    doc.fontSize(12).text('This is a generated PDF!');
    doc.text('Here is some more content.');

    doc.end();
  } catch (e) {
    console.log(e)
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Server error generating PDF' });
    }
    res.end();
  }
}