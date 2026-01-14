import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { verifyGoogleToken } from "../services/verifyGoogleToken";
import { User } from "../../profile/models/user";
import { JWT_SECRET } from "../../../config/env";

export async function signupController(req: Request, res: Response) {
  try {
    const { token } = req.body;

    const payload: any = await verifyGoogleToken(token);

    const {
      sub: google_id,
      email,
      name,
      picture,
    } = payload;

    let user = await User.findOne({ google_id });

    if (!user) {
      user = await User.create({
        google_id,
        email,
        name,
        avatar: picture,
        provider: "google",
      });
    }

    const appToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({
      token: appToken,
      user,
    });

  } catch (err) {
    res.status(401).json({ message: "Invalid Google token" });
  }
}
