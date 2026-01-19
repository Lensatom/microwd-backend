import { Router } from 'express';
import { getEventByIdController, getUserEventsController } from '../controllers/readEvents';
import { postEventsController } from '../controllers/writeEvents';

const eventsRouter = Router();

eventsRouter.post('/', postEventsController);
eventsRouter.get('/me', getUserEventsController);
eventsRouter.get('/:id', getEventByIdController);

export default eventsRouter;