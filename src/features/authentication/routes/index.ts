import { Router } from "express";
import { signupController } from "../controllers/signupController";

const authRouter = Router();

authRouter.post('/signup', signupController);