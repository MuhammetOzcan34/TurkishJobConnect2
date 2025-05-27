import express from 'express';
import cors from 'cors';
import dashboardRoutes from '../routes/dashboard';
import userRoutes from '../routes/user';

const app = express();

// CORS ve JSON middleware'lerini ekle
app.use(cors());
app.use(express.json());

// Test endpoint'i
app.get("/api/test-ping", (req, res) => {
  res.status(200).json({ message: "API çalışıyor!" });
});

// Route'ları kaydet
app.use(dashboardRoutes);
app.use(userRoutes);

// Vercel için export
export default app; 