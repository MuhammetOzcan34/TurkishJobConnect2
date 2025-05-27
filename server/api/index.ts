import express from 'express';
import cors from 'cors';
import { registerRoutes } from '../routes';

const app = express();

// CORS ve JSON middleware'lerini ekle
app.use(cors());
app.use(express.json());

// Route'ları kaydet
registerRoutes(app);

// Vercel için export
export default app; 