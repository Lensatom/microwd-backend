import { verifySocketJWTMiddleware } from "../../../middlewares/verifyJWT";
import { encodeWithCrypto } from "../../../services/crypto";
import { getIO } from "../../../socket";

let attendanceTokenIntervals: { [key: string]: NodeJS.Timeout } = {};

function handleEmitTokens(
  socket: any,
  event: { _id: string; name?: string },
  attendanceNs: any,
) {
  const intervalInSeconds = 5;
  const payload = { eventId: event._id, name: event.name };
  const attendanceToken = encodeWithCrypto(JSON.stringify(payload), 5);
  attendanceNs.to(event._id).emit('new-attendance-token', { attendanceToken });
  attendanceTokenIntervals[event._id] = setTimeout(() => verifySocketJWTMiddleware(
    socket,
    () => handleEmitTokens(socket, event, attendanceNs)
  ), intervalInSeconds * 1000);
}

export function streamAttendanceTokens(socket: any, event: { _id: string; name?: string }) {
  const io = getIO();
  const attendanceNs = io.of('/events');

  if (!event || !event._id) {
    socket.emit('attendance-error', { message: 'event payload is required (include event or eventId)' });
    return;
  }

  socket.join(event._id);

  if (attendanceTokenIntervals[event._id]) {
    return;
  }

  try {
    handleEmitTokens(socket, event, attendanceNs);
  } catch (err) {
    console.error('Failed to sign attendance token:', err);
    attendanceNs.to(event._id).emit('attendance-error', { message: 'Failed to generate token' });
  }
}




export function endAttendanceTokensStream(sessionId: string) {
  if (attendanceTokenIntervals[sessionId]) {
    clearTimeout(attendanceTokenIntervals[sessionId]);
    delete attendanceTokenIntervals[sessionId];
  }
}