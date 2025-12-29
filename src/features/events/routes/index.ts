import { Router } from 'express';
import { attendanceController } from '../controllers';

const eventsRouter = Router();

// TODOS:
// 1. create event
// 2. get event by id
// 3. list events
// 4. update event
// 5. delete event

eventsRouter.get('/attendance/record', attendanceController);

export default eventsRouter;