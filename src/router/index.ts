import { Request, Response } from "express";
import eventsRouter from "../features/events/routes";
import { authRouter } from "../features/authentication/routes";
import { verifyJWTMiddleware } from "../middlewares/verifyJWT";

export function router(app: any) {
  app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
  });

  app.use('/auth', authRouter);

  app.use(verifyJWTMiddleware);

  app.use('/events', eventsRouter);
}