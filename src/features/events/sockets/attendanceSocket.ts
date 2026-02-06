import type { Server, Socket } from "socket.io";
import { verifySocketJWTMiddleware } from "../../../middlewares/verifyJWT";
import { endAttendanceTokensStream, streamAttendanceTokens } from "../services/attendanceService";

function registerEventNamespace(io: Server) {
  const eventNS = io.of(`/api/v1/events`);

  eventNS.on('connection', (socket: Socket) => {
    let event: any;

    socket.on('stream-attendance-tokens', (data) => {
      event = data?.event || null;
      verifySocketJWTMiddleware(socket, () => streamAttendanceTokens(socket, event));
    });

    socket.on('disconnect', () => {
      endAttendanceTokensStream(event?._id);
    });
  });
}

export { registerEventNamespace };