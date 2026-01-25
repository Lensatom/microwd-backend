import jwt from "jsonwebtoken";
import { verifySocketJWTMiddleware } from "../../../middlewares/verifyJWT";
import { verifyJWTService } from "../../../services/verifyJWT";
import { getIO } from "../../../socket";

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





export async function verifyAttendance(attendanceToken: string, callbackFunction?: (result: { success: boolean; message: string }) => void) {
  try {
    const { isValid } = verifyJWTService(attendanceToken);
    if (!isValid) {
      if (!callbackFunction) return
      callbackFunction({ success: false, message: 'Invalid attendance token' });
      return
    }

    // await Attendance.create({

    // })

    if (callbackFunction) callbackFunction({ success: true, message: 'Attendance verified successfully' });
    return
  } catch (err) {
    if (callbackFunction) callbackFunction({ success: false, message: 'Invalid attendance token' });
    return;
  }
}




export function endAttendanceTokensStream(sessionId: string) {
  if (attendanceTokenIntervals[sessionId]) {
    clearInterval(attendanceTokenIntervals[sessionId]);
    delete attendanceTokenIntervals[sessionId];
  }
}