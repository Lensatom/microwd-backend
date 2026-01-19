import type { Server, Socket } from "socket.io";
import { endAttendanceTokensStream, streamAttendanceTokens, verifyAttendance } from "../services/attendanceService";
import { verifySocketJWTMiddleware } from "../../../middlewares/verifyJWT";

function registerAttendanceNamespace(io: Server) {
  const attendanceNs = io.of('/events');

  attendanceNs.on('connection', (socket: Socket) => {
    socket.on('stream-attendance-tokens', (data) => {
      const event = data?.data?.event || null;
      verifySocketJWTMiddleware(socket, () => streamAttendanceTokens(socket, event));
    });

    socket.on('record-attendance', (data, callbackFunction) => {
      verifySocketJWTMiddleware(socket, () => verifyAttendance(data.data.token, callbackFunction));
    });

    socket.on('disconnect', () => {
      endAttendanceTokensStream(socket.id);
    });
  });
}

export { registerAttendanceNamespace };

