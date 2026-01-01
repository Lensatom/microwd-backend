import type { Server, Socket } from "socket.io";
import { endAttendanceTokensStream, streamAttendanceTokens, verifyAttendance } from "../services/attendanceService";

function registerAttendanceNamespace(io: Server) {
  const attendanceNs = io.of('/events');
  console.log("Attendance namespace registered at '/events'");

  attendanceNs.on('connection', (socket: Socket) => {
    console.log(`New client connected to attendance namespace: ${socket.id}`);

    socket.on('stream-attendance-tokens', (data) => {
      console.log('Stream request received:', data);
      const sessionId = socket.id;
      socket.join(sessionId);
      const event = data?.data?.event || null;
      if (!event || !event.id) {
        console.log(event)
        socket.emit('attendance-error', { message: 'event payload is required (include event or eventId)' });
        return;
      }
      streamAttendanceTokens(sessionId, event);
    });

    socket.on('record-attendance', (data, callbackFunction) => {
      console.log('Attendance marked:', data);
      const verificationResult = verifyAttendance(data.data.token);
      if (callbackFunction) {
        console.log({verificationResult})
        callbackFunction(verificationResult);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected from attendance namespace');
      endAttendanceTokensStream(socket.id);
    });
  });
}

export { registerAttendanceNamespace };