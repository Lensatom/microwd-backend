import { verifyJWTService } from "../../../services/verifyJWT";
import { Attendance } from "../models/attendance";
import { Event } from "../../events/models/event";
import { User } from "../../users/models/user";

export async function verifyAttendance(
  data: { attendanceToken: string; additionalInfo?: Record<string, string>, eventId: string, userId: string },
  callbackFunction: (result: { success: boolean; message: string }) => void
) {
  console.log(data);
  try {
    const attendanceToken = data?.attendanceToken;
    if (!attendanceToken) {
      callbackFunction({ success: false, message: 'Attendance token is required' });
      return;
    }

    const { isValid, decoded } = verifyJWTService(attendanceToken);
    if (!isValid || !decoded) {
      callbackFunction({ success: false, message: 'Invalid attendance token' });
      return;
    }

    const eventId = decoded.eventId
    if (eventId !== data?.eventId) {
      callbackFunction({ success: false, message: 'Attendance token does not match event' });
      return;
    }
    const event = await Event.findById(eventId);
    if (!event) {
      callbackFunction({ success: false, message: 'Event not found' });
      return;
    }

    const existingRecord = await Attendance.findOne({ user_id: data.userId, event_id: data.eventId });
    if (existingRecord) {
      callbackFunction({ success: false, message: 'Attendance already recorded' });
      return;
    }

    const additionalInfoRequired = event.additionalInfoFields || [];
    if (additionalInfoRequired.length > 0 && (!data?.additionalInfo)) {
      callbackFunction({ success: false, message: JSON.stringify(data) });
      return;
    }

    let additionalInfoArray = [];
    
    for (let i = 0; i < additionalInfoRequired.length; i++) {
      const info = additionalInfoRequired[i];
      if (!data?.additionalInfo) {
        callbackFunction({ success: false, message: `Missing required field: ${info}` });
        return;
      }
      if (!data.additionalInfo[info]) {
        callbackFunction({ success: false, message: `Missing required field: ${info}` });
        return;
      }
      additionalInfoArray.push({ field: info, value: data.additionalInfo[info] });
    }

    const user = await User.findById(data.userId);
    if (!user) {
      callbackFunction({ success: false, message: 'User not found' });
      return;
    }

    await Attendance.create({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      additionalInfo: additionalInfoArray,
      user_id: data.userId,
      event_id: eventId
    });

    callbackFunction({ success: true, message: 'Attendance verified successfully' });
    return;
  } catch (err) {
    console.log(err)
    callbackFunction({ success: false, message: 'Error validating attendance token' });
    return;
  }
}