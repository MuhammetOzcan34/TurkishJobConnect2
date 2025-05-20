import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { generatePdfQuote } from "./utils/pdf";
import {
  insertAccountSchema,
  insertTransactionSchema,
  insertQuoteSchema,
  insertQuoteItemSchema,
  insertProjectSchema,
  insertTaskSchema,
  QuoteItem,
  InsertQuoteItem,
  Project,
  Quote
} from "@shared/schema";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import bcrypt from 'bcryptjs';
import dashboardRoutes from './api/dashboardRoutes';
import userRoutes from './api/userRoutes';

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Test endpoint
  app.get("/api/test-ping", (req: Request, res: Response) => {
    res.status(200).json({ message: "Sunucu ayakta ve çalışıyor!" });
  });

  // Dashboard ve kullanıcı rotalarını bağla
  app.use('/api', dashboardRoutes);
  app.use('/api', userRoutes);

  // --- Kullanıcı endpointlerini buradan kaldırdık! ---

  // Cari Hesap rotaları
  app.get("/api/accounts", async (req: Request, res: Response) => {
    try {
      const accounts = await storage.getAccounts();
      const accountsWithCounts = await Promise.all(
        accounts.map(async account => {
          const projects = await storage.getProjectsByAccount(account.id);
          const tasks = await storage.getTasksByAccount(account.id);
          return {
            ...account,
            projects: projects.length,
            tasks: tasks.length
          };
        })
      );
      res.json(accountsWithCounts);
    } catch (error: any) {
      res.status(500).json({ message: "Cari hesaplar alınırken bir sunucu hatası oluştu." });
    }
  });

  app.post("/api/accounts", async (req: Request, res: Response) => {
    try {
      const accountData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(accountData);
      res.status(201).json(account);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz cari hesap bilgileri.", errors: error.format() });
      }
      res.status(500).json({ message: "Cari hesap oluşturulurken bir sunucu hatası oluştu." });
    }
  });

  // ... (diğer accounts, quotes, projects, tasks, login, profile, pdf, reports endpointleri aynı şekilde devam edecek) ...

  // Örnek: Kimlik Doğrulama Rotaları
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        username: z.string().min(1, "Kullanıcı adı gerekli."),
        password: z.string().min(1, "Şifre gerekli.")
      });
      const { username, password: plainPassword } = schema.parse(req.body);
      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı." });
      }
      const isPasswordMatch = await bcrypt.compare(plainPassword, user.password);
      if (!isPasswordMatch) {
        return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı." });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token: "ornek-jwt-token"
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz giriş bilgileri.", errors: error.format() });
      }
      res.status(500).json({ message: "Giriş yapılırken bir sunucu hatası oluştu." });
    }
  });

  // ... (diğer endpointler aynı şekilde devam edecek) ...

  return httpServer;
}