import express from 'express';
import http from 'http';
import { router } from './router';
import { initSocket } from './socket';

const app = express();

app.use(express.json());

router(app);

const server = http.createServer(app);

initSocket(server)

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});