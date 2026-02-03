import { Router } from "express";
import { getMeController } from "../controllers/readUsers";
import { updateMeController } from "../controllers/updateUsers";

const profileRouter = Router()

profileRouter.get("/", getMeController)
// profileRouter.put("/me", updateMeController)

export default profileRouter;