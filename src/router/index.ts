import { Request, Response } from "express";
import eventsRouter from "../features/events/routes";

export function router(app: any) {
  app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
  });

  app.use('/events', eventsRouter);
}