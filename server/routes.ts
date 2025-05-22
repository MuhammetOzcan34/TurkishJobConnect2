import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import dashboardRoutes from './api/dashboardRoutes';
import userRoutes from './api/userRoutes';
import { storage } from "./storage";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { insertAccountSchema, insertQuoteSchema, insertProjectSchema, insertTaskSchema } from "@shared/schema";
import { generatePdfQuote } from "./utils/pdf";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Test endpoint
  app.get("/api/test-ping", (req: Request, res: Response) => {
    res.status(200).json({ message: "Sunucu ayakta ve çalışıyor!" });
  });

  // Dashboard ve kullanıcı rotalarını bağla
  app.use('/api', dashboardRoutes);
  app.use('/api', userRoutes);

  // ... diğer endpointler (accounts, quotes, projects, tasks, login, profile, pdf, reports) ...

  return httpServer;
}