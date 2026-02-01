import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { Response } from "express";
import fs from "fs";
import path from "path";
import { r2 } from "../../../config/r2";
import { AuthRequest } from "../../../types/express";
import { Attendance } from "../../attendance/models/attendance";
import { Event } from "../models/event";
import { BUCKET, generateCsv, r2ObjectExists, TMP_DIR } from "../services/fileService";

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
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const attendance = await Attendance.find({ event_id: eventId });
    const dataLength = attendance.length;

    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(attendance))
      .digest("hex")
      .slice(0, 12);

    const fileName = `report-${dataLength}-${hash}.csv`;
    const key = `reports/${fileName}`;

    const exists = await r2ObjectExists(key);

    if (!exists) {
      const localPath = path.join(TMP_DIR, fileName);

      // @ts-ignore
      await generateCsv(localPath, event, attendance);

      const expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const fileBuffer = await fs.promises.readFile(localPath);
      await r2.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: fileBuffer,
          ContentType: "text/csv",
          CacheControl: "no-store",
          Expires: expireAt,
          ContentLength: fileBuffer.length,
          ContentDisposition: `attachment; filename=${fileName}`,
          Metadata: {
            "auto-delete": "true",
            ttl: "1d",
            "expire-at": expireAt.toISOString(),
          },
        })
      );

      fs.unlink(localPath, () => {});
    }

    const signedUrl = await getSignedUrl(
      r2,
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ResponseContentType: "text/csv",
        ResponseContentDisposition: `attachment; filename=${fileName}`,
      }),
      { expiresIn: 60 * 5 }
    );

    res.json({
      length: dataLength,
      fileName,
      reused: exists,
      url: signedUrl,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Server error" });
  }
}