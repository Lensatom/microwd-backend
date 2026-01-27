import { Request, Response } from "express";
import { authRouter } from "../features/authentication/routes";
import eventsRouter from "../features/events/routes";
import profileRouter from "../features/users/routes";
import { verifyJWTMiddleware } from "../middlewares/verifyJWT";
import attendanceRouter from "../features/attendance/routes";

export function router(app: any) {
  app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
  });

  app.use('/auth', authRouter);

  app.use(verifyJWTMiddleware);

  app.use('/events', eventsRouter);
  app.use('/attendance', attendanceRouter);
  app.use("/user", profileRouter)
}