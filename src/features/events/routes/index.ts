import { Router } from 'express';
import { getEventByIdController, getUserEventsController } from '../controllers/getEvent';
import { postEventsController } from '../controllers/postEvents';

const eventsRouter = Router();

eventsRouter.post('/', postEventsController);
eventsRouter.get('/:id', getEventByIdController);
eventsRouter.get('/me', getUserEventsController);

export default eventsRouter;