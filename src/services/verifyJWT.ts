import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

export function verifyJWTService(token: string): any {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string);
    return { isValid: true, decoded };
  } catch (err) {
    return { isValid: false, decoded: null };
  }
}