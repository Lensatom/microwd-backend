import cors from "cors";
import express from 'express';
import http from 'http';
import { getCorsOptions } from './config/cors';
import { connectDB } from './database';
import { router } from './router';
import { initSocket } from './socket';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

app.use(cors(getCorsOptions()));

app.use(express.json());

router(app);

initSocket(server);

async function bootstrap() {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed due to DB connection error:", err);
    process.exit(1);
  }
}

bootstrap();