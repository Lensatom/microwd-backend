import { Response } from "express";
import { AuthRequest } from "../../../types/express";
import { User } from "../models/user";

export async function getMeController(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId
    const user = await User.findById(userId)
    return res.status(200).json({message: "User data retrieved", user})
  } catch (error) {

  }

}