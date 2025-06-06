import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";

import dashboardRoutes from './routes/dashboard';
import userRoutes from './routes/user';

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  app.get("/api/test-ping", (req: Request, res: Response) => {
    res.status(200).json({ message: "Sunucu ayakta ve çalışıyor!" });
  });

  // Route'ları ana uygulamaya bağlıyoruz
  app.use(dashboardRoutes);
  app.use(userRoutes);

  return httpServer;
}