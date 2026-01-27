import { Server } from "socket.io";
import { registerAttendanceNamespace } from "../features/attendance/controllers/socket/attendanceSocket";
import { registerEventNamespace } from "../features/events/sockets/attendanceSocket";

let io: Server;

export function initSocket(server: any) {
  io = new Server(server, {
    cors: {
      origin: "*",
    }
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
  });

  registerEventNamespace(io);
  registerAttendanceNamespace(io);

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}