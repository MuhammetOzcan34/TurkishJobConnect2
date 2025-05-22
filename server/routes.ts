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

  // Cari Hesap rotaları
  app.get("/api/accounts", async (req: Request, res: Response) => {
    try {
      const accounts = await storage.getAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Cari hesaplar alınırken bir hata oluştu." });
    }
  });

  app.post("/api/accounts", async (req: Request, res: Response) => {
    try {
      const accountData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz cari hesap bilgileri.", errors: error.format() });
      }
      res.status(500).json({ message: "Cari hesap oluşturulurken bir hata oluştu." });
    }
  });

  // Teklif rotaları
  app.get("/api/quotes", async (req: Request, res: Response) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Teklifler alınırken bir hata oluştu." });
    }
  });

  app.post("/api/quotes", async (req: Request, res: Response) => {
    try {
      const quoteData = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(quoteData);
      res.status(201).json(quote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz teklif bilgileri.", errors: error.format() });
      }
      res.status(500).json({ message: "Teklif oluşturulurken bir hata oluştu." });
    }
  });

  // Proje rotaları
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Projeler alınırken bir hata oluştu." });
    }
  });

  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz proje bilgileri.", errors: error.format() });
      }
      res.status(500).json({ message: "Proje oluşturulurken bir hata oluştu." });
    }
  });

  // Görev rotaları
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Görevler alınırken bir hata oluştu." });
    }
  });

  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz görev bilgileri.", errors: error.format() });
      }
      res.status(500).json({ message: "Görev oluşturulurken bir hata oluştu." });
    }
  });

  // Profil rotası (örnek)
  app.get("/api/profile", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserById(req.query.userId as string);
      if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı." });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Profil alınırken bir hata oluştu." });
    }
  });

  // PDF oluşturma rotası (örnek)
  app.post("/api/quotes/:id/pdf", async (req: Request, res: Response) => {
    try {
      const quoteId = req.params.id;
      const quote = await storage.getQuoteById(quoteId);
      if (!quote) {
        return res.status(404).json({ message: "Teklif bulunamadı." });
      }
      const pdfBuffer = await generatePdfQuote(quote);
      res.setHeader("Content-Type", "application/pdf");
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ message: "PDF oluşturulurken bir hata oluştu." });
    }
  });

  // Raporlar rotası (örnek)
  app.get("/api/reports", async (req: Request, res: Response) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Raporlar alınırken bir hata oluştu." });
    }
  });

  // Kimlik Doğrulama Rotaları
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
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz giriş bilgileri.", errors: error.format() });
      }
      res.status(500).json({ message: "Giriş yapılırken bir hata oluştu." });
    }
  });

  return httpServer;
}