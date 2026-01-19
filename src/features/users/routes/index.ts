import { Router } from "express";
import { getMeController } from "../controllers/readUsers";

const profileRouter = Router()

profileRouter.get("/", getMeController)

export default profileRouter;