import { Router } from "express";
import { signupController } from "../controllers/signupController";

export const authRouter = Router();

authRouter.post('/signup/google', signupController);