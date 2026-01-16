import { verifyJWT as verifyJWTService } from "../services/verifyJWT";

export function verifyJWT(req: any, res: any, next: any) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const { isValid, decoded } = verifyJWTService(token.replace("Bearer ", ""));

  if (!isValid) {
    return res.status(401).json({ message: "Invalid token" });
  }

  req.userId = decoded.userId;

  next();
}