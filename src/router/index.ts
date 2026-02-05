import { Router } from "express";
import attendanceRouter from "../features/attendance/routes";
import { authRouter } from "../features/authentication/routes";
import eventsRouter from "../features/events/routes";
import profileRouter from "../features/users/routes";
import { verifyJWTMiddleware } from "../middlewares/verifyJWT";

const appRouter = Router();

appRouter.use('/auth', authRouter);

appRouter.use(verifyJWTMiddleware);

appRouter.use('/events', eventsRouter);
appRouter.use('/attendance', attendanceRouter);
appRouter.use("/user", profileRouter)

export default appRouter;