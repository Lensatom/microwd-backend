import jwt from "jsonwebtoken";
import { verifySocketJWTMiddleware } from "../../../middlewares/verifyJWT";
import { verifyJWTService } from "../../../services/verifyJWT";
import { getIO } from "../../../socket";
import { Attendance } from "../models/attendance";
import { User } from "../../users/models/user";
import { Event } from "../models/event";

const secret = process.env.JWT_SECRET || 'dev-secret';
let attendanceTokenIntervals: { [key: string]: NodeJS.Timeout } = {};




export function streamAttendanceTokens(socket: any, event: { _id: string; name?: string }) {
  const io = getIO();
  const attendanceNs = io.of('/events');
  const sessionId = socket.id;
  const intervalInSeconds = 5;

  if (!event || !event._id) {
    socket.emit('attendance-error', { message: 'event payload is required (include event or eventId)' });
    return;
  }

  attendanceTokenIntervals[sessionId] = setInterval(() => verifySocketJWTMiddleware(socket, () => {
    try {
      const payload = { eventId: event._id, name: event.name };
      const attendanceToken = jwt.sign(payload, secret, { expiresIn: `${intervalInSeconds}s` });
      attendanceNs.to(sessionId).emit('new-attendance-token', { attendanceToken });
    } catch (err) {
      console.error('Failed to sign attendance token:', err);
      attendanceNs.to(sessionId).emit('attendance-error', { message: 'Failed to generate token' });
    }
  }), intervalInSeconds * 1000);
}





export async function verifyAttendance(
  data: { attendanceToken: string; userData: any, eventId: string, userId: string },
  callbackFunction: (result: { success: boolean; message: string }) => void
) {
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
    
    const additionalInfoRequired = event.additionalInfoFields || [];
    if (additionalInfoRequired.length > 0 && (!data?.userData || !data.userData.additionalInfoFields)) {
      callbackFunction({ success: false, message: 'Additional info fields are required' });
      return;
    }
    for (let i = 0; i < additionalInfoRequired.length; i++) {
      const info = additionalInfoRequired[i];
      if (
        data.userData[i].value === undefined ||
        data.userData[i].value === null ||
        data.userData[i].value === ''
      ) {
        callbackFunction({ success: false, message: `Missing required field: ${info}` });
        return;
      }
    }

    const existingRecord = await Attendance.findOne({ user_id: data.userId, event_id: data?.eventId });
    if (existingRecord) {
      callbackFunction({ success: false, message: 'Attendance already recorded' });
      return;
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
      additionalInfo: data.userData?.additionalInfoFields || [],
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




export function endAttendanceTokensStream(sessionId: string) {
  if (attendanceTokenIntervals[sessionId]) {
    clearInterval(attendanceTokenIntervals[sessionId]);
    delete attendanceTokenIntervals[sessionId];
  }
}