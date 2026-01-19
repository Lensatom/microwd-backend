import { Response } from "express";
import { AuthRequest } from "../../../types/express";
import { User } from "../models/user";

export async function updateMeController(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
  
    await User.updateOne({ _id: userId }, req.body);
  
    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}