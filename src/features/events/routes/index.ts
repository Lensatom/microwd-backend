import { Router } from 'express';
import { deleteEventByIdController } from '../controllers/deleteEvents';
import { getEventAttendanceListController, getEventAttendanceListCsvController, getEventByIdController, getUserEventsController } from '../controllers/readEvents';
import { updateEventByIdController } from '../controllers/updateEvents';
import { postEventsController } from '../controllers/writeEvents';

const eventsRouter = Router();

eventsRouter.post('/', postEventsController);
eventsRouter.get('/me', getUserEventsController);
eventsRouter.get('/:id', getEventByIdController);
eventsRouter.get('/:id/attendance-list', getEventAttendanceListController);
eventsRouter.get('/:id/attendance-list/download', getEventAttendanceListCsvController);
eventsRouter.put('/:id', updateEventByIdController);
eventsRouter.delete('/:id', deleteEventByIdController);

export default eventsRouter;