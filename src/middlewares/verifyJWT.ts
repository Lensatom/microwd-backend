import { Request, Response, NextFunction } from "express";
import { verifyJWT as verifyJWTService } from "../services/verifyJWT";
import { AuthRequest } from "../types/express";

export function verifyJWT(req: AuthRequest, res: Response, next: NextFunction) {
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
}