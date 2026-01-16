import express from 'express';
import http from 'http';
import { router } from './router';
import { initSocket } from './socket';
import cors from "cors";
import { connectDB } from './database';

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}))

app.use(express.json());

router(app);

const server = http.createServer(app);

initSocket(server)

const PORT = process.env.PORT || 4000;

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