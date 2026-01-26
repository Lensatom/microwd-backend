import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/express";
import { verifyJWTService } from "../services/verifyJWT";

export function verifyJWTMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
  
    const { isValid, decoded } = verifyJWTService(token.replace("Bearer ", ""));
  
    if (!isValid) {
      return res.status(401).json({ message: "Invalid token" });
    }
  
    const userId = (decoded as any)?.userId as string | undefined;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }
    
    req.userId = userId;
  
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function verifySocketJWTMiddleware(socket: any, next: any) {
  const { isValid, decoded } = verifyJWTService(socket.handshake.auth?.token || '');
  if (!isValid) {
    socket.emit('attendance-error', { message: 'Unauthorized: Invalid or missing token' });
    socket.disconnect();
    return;
  }
  next(decoded);
}