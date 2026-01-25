export function getCorsOptions() {
  return {
    origin: ['http://localhost:3000', 'http://192.168.0.190:3000', 'https://microwd-webapp.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  };
}