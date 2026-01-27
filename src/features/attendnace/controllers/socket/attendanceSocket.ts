import type { Server, Socket } from "socket.io";
import { verifySocketJWTMiddleware } from "../../../../middlewares/verifyJWT";
import { verifyAttendance } from "../../services/attendanceService";

function registerAttendanceNamespace(io: Server) {
  const attendanceNs = io.of('/attendance');

  attendanceNs.on('connection', (socket: Socket) => {
    socket.on('record-attendance', (data, callbackFunction) => {
      if (!callbackFunction) {
        socket.emit('attendance-error', { message: 'Callback function is required' });
        return;
      }
      verifySocketJWTMiddleware(socket, (decoded: { userId: string }) => verifyAttendance({...data, userId: decoded.userId}, callbackFunction));
    });
  });
}

export { registerAttendanceNamespace };