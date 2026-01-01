import { getIO } from "../../../socket";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || 'dev-secret';

let attendanceTokenIntervals: { [key: string]: NodeJS.Timeout } = {};

function streamAttendanceTokens(sessionId: string, event: { id: string; name?: string }) {
  const intervalInSeconds = 5;

  if (!event || !event.id) {
    console.warn('streamAttendanceTokens called without a valid event payload');
    return;
  }

  const io = getIO();
  const attendanceNs = io.of('/events');

  attendanceTokenIntervals[sessionId] = setInterval(() => {
    try {
      const payload = { eventId: event.id, name: event.name };
      const attendanceToken = jwt.sign(payload, secret, { expiresIn: `${intervalInSeconds}s` });
      attendanceNs.to(sessionId).emit('new-attendance-token', { attendanceToken });
    } catch (err) {
      console.error('Failed to sign attendance token:', err);
      attendanceNs.to(sessionId).emit('attendance-error', { message: 'Failed to generate token' });
    }
  }, intervalInSeconds * 1000);
}

function endAttendanceTokensStream(sessionId: string) {
  if (attendanceTokenIntervals[sessionId]) {
    clearInterval(attendanceTokenIntervals[sessionId]);
    delete attendanceTokenIntervals[sessionId];
  }
}

function verifyAttendance(token: string) {
  console.log('Verifying attendance token:', token);
  try {
    const decoded = jwt.verify(token, secret);
    return { isValid: true, decoded };
  } catch (err) {
    return { isValid: false };
  }
}

export {
  streamAttendanceTokens,
  verifyAttendance,
  endAttendanceTokensStream
};