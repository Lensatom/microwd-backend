import { Router } from 'express';
import { getEventByIdController, getUserEventsController } from '../controllers/readEvents';
import { postEventsController } from '../controllers/writeEvents';
import { updateEventByIdController } from '../controllers/updateEvents';
import { deleteEventByIdController } from '../controllers/deleteEvents';

const eventsRouter = Router();

eventsRouter.post('/', postEventsController);
eventsRouter.get('/me', getUserEventsController);
eventsRouter.get('/:id', getEventByIdController);
eventsRouter.put('/:id', updateEventByIdController);
eventsRouter.delete('/:id', deleteEventByIdController);

export default eventsRouter;