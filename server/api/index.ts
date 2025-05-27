import express from 'express';
import cors from 'cors';
import dashboardRoutes from '../routes/dashboard';
import userRoutes from '../routes/user';

const app = express();

// CORS yapılandırması
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://turkish-job-connect2-30rpk2y9r-muhammetozcan34s-projects.vercel.app']
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Error handler middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// Test endpoint'i
app.get("/api/test-ping", (req, res) => {
  res.status(200).json({ message: "API çalışıyor!" });
});

// Route'ları kaydet
app.use(dashboardRoutes);
app.use(userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Vercel için export
export default app; 