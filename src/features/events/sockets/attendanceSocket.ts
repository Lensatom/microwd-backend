import type { Server, Socket } from "socket.io";
import { endAttendanceTokensStream, streamAttendanceTokens, verifyAttendance } from "../services/attendanceService";
import { verifySocketJWTMiddleware } from "../../../middlewares/verifyJWT";

function registerEventNamespace(io: Server) {
  const eventNS = io.of('/events');

  eventNS.on('connection', (socket: Socket) => {
    socket.on('stream-attendance-tokens', (data) => {
      const event = data?.event || null;
      verifySocketJWTMiddleware(socket, () => streamAttendanceTokens(socket, event));
    });

    socket.on('record-attendance', (data, callbackFunction) => {
      if (!callbackFunction) {
        socket.emit('attendance-error', { message: 'Callback function is required' });
        return;
      }
      verifySocketJWTMiddleware(socket, (decoded: { userId: string }) => verifyAttendance({...data, userId: decoded.userId}, callbackFunction));
    });

    socket.on('disconnect', () => {
      endAttendanceTokensStream(socket.id);
    });
  });
}

export { registerEventNamespace };