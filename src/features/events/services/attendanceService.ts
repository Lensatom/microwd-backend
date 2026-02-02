import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../config/env";
import { verifySocketJWTMiddleware } from "../../../middlewares/verifyJWT";
import { getIO } from "../../../socket";
import { encodeWithCrypto } from "../../../services/crypto";

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

  try {
    const payload = { eventId: event._id, name: event.name };
    const attendanceToken = encodeWithCrypto(JSON.stringify(payload), 5);
    attendanceNs.to(sessionId).emit('new-attendance-token', { attendanceToken });
    attendanceTokenIntervals[sessionId] = setTimeout(() => verifySocketJWTMiddleware(
      socket,
      () => streamAttendanceTokens(socket, event)
    ), intervalInSeconds * 1000);
  } catch (err) {
    console.error('Failed to sign attendance token:', err);
    attendanceNs.to(sessionId).emit('attendance-error', { message: 'Failed to generate token' });
  }
}




export function endAttendanceTokensStream(sessionId: string) {
  if (attendanceTokenIntervals[sessionId]) {
    clearInterval(attendanceTokenIntervals[sessionId]);
    delete attendanceTokenIntervals[sessionId];
  }
}