import { Response } from "express";
import { AuthRequest } from "../../../types/express";
import { Attendance } from "../models/attendance";

export async function getAttendanceHistoryController(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId
    const data = await Attendance.aggregate([
      { $match: { user_id: userId } },
      {
        $addFields: {
          eventObjectId: {
            $convert: { input: "$event_id", to: "objectId", onError: null, onNull: null }
          }
        }
      },
      {
        $lookup: {
          from: "events",
          localField: "eventObjectId",
          foreignField: "_id",
          as: "event"
        }
      },
      { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
      { $project: { event_id: 0, eventObjectId: 0 } }
    ]);

    return res.status(200).json({ message: "Attendance data retrieved", data })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to retrieve attendance data", error });
  }
}