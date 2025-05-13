import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage"; // './storage' dosyasının var olduğundan ve doğru exportları yaptığından emin olun
import { z } from "zod";
import { generatePdfQuote } from "./utils/pdf"; // './utils/pdf' dosyasının var olduğundan emin olun
import {
  insertUserSchema,
  insertAccountSchema,
  insertTransactionSchema,
  insertQuoteSchema,
  insertQuoteItemSchema,
  insertProjectSchema,
  insertTaskSchema,
  users as usersTable, // Kullanılmıyorsa kaldırılabilir
  QuoteItem, // quoteItems için tip tanımı
  InsertQuoteItem, // quoteItems için tip tanımı
  Project, // Proje tipi için
  Quote // Teklif tipi için
} from "@shared/schema";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import bcrypt from 'bcryptjs'; // Şifreleme için bcryptjs'i import edin
import dashboardRoutes from './api/dashboardRoutes'; // Dashboard rotalarını import et

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Test rotası
  app.get("/api/test-ping", (req: Request, res: Response) => {
    console.log("[Sunucu] /api/test-ping isteği alındı!");
    res.status(200).json({ message: "Sunucu ayakta ve çalışıyor!" });
  });

  // Dashboard Rotaları
  app.use('/api', dashboardRoutes); // '/api/dashboard/stats' gibi adresleri aktif hale getirecek

  // API Rotaları

  // Kullanıcı rotaları
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const allUsers = await storage.getUsers();
      // Şifreleri yanıttan çıkar
      res.json(allUsers.map(({ password, ...userWithoutPassword }) => userWithoutPassword));
    } catch (error: any) {
      console.error("Kullanıcılar alınırken hata:", error);
      res.status(500).json({ message: "Kullanıcılar alınırken bir sunucu hatası oluştu." });
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      // Şifreyi hash'le
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      const newUser = await storage.createUser({
        ...validatedData,
        password: hashedPassword, // Hash'lenmiş şifreyi kaydet
      });

      const { password, ...userWithoutPassword } = newUser; // Şifreyi yanıttan çıkar
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Zod hatalarını formatlayarak daha anlaşılır hale getir
        return res.status(400).json({ message: "Geçersiz kullanıcı bilgileri.", errors: error.format() });
      } else {
        console.error("Kullanıcı oluşturulurken hata:", error);
        res.status(500).json({ message: "Kullanıcı oluşturulurken bir sunucu hatası oluştu." });
      }
    }
  });

  // Dashboard rotaları ARTIK dashboardRoutes.ts DOSYASINDA TANIMLI
  // Bu bloklar buradan kaldırılabilir veya dashboardRoutes.ts içindeki tanımlarla çakışmaması için yorum satırına alınabilir.
  // Eğer dashboardRoutes.ts dosyasındaki tanımlar /api/dashboard ön ekiyle başlıyorsa,
  // app.use('/api', dashboardRoutes); satırı yeterlidir.
  // Eğer dashboardRoutes.ts dosyasındaki tanımlar sadece /stats, /activities gibi ise,
  // o zaman app.use('/api/dashboard', dashboardRoutes); şeklinde kullanılmalıdır.
  // Mevcut dashboardRoutes.ts dosyanızda rotalar /dashboard/stats şeklinde olduğu için
  // app.use('/api', dashboardRoutes); kullanımı doğrudur.

  /*
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    // ... (Bu kod artık dashboardRoutes.ts içinde)
  });

  app.get("/api/dashboard/activities", async (req: Request, res: Response) => {
    // ... (Bu kod artık dashboardRoutes.ts içinde)
  });

  app.get("/api/dashboard/upcoming-tasks", async (req: Request, res: Response) => {
    // ... (Bu kod artık dashboardRoutes.ts içinde)
  });

  app.get("/api/dashboard/active-projects", async (req: Request, res: Response) => {
    // ... (Bu kod artık dashboardRoutes.ts içinde)
  });

  app.get("/api/dashboard/recent-quotes", async (req: Request, res: Response) => {
    // ... (Bu kod artık dashboardRoutes.ts içinde)
  });
  */


  // Cari Hesap rotaları
  app.get("/api/accounts", async (req: Request, res: Response) => {
    try {
      const accounts = await storage.getAccounts();
      // Her bir hesap için proje ve görev sayılarını al (Performans için optimize edilebilir)
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
      console.error("Cari hesaplar alınırken hata:", error);
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
      console.error("Cari hesap oluşturulurken hata:", error);
      res.status(500).json({ message: "Cari hesap oluşturulurken bir sunucu hatası oluştu." });
    }
  });

  app.get("/api/accounts/:id", async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.id);
      if (isNaN(accountId)) {
        return res.status(400).json({ message: "Geçersiz hesap ID." });
      }
      const account = await storage.getAccount(accountId);
      if (!account) {
        return res.status(404).json({ message: "Cari hesap bulunamadı." });
      }
      // Bakiye hesaplama
      const transactions = await storage.getTransactionsByAccount(accountId);
      const totalDebit = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + Number(t.amount), 0);
      const totalCredit = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount), 0);
      const balance = totalDebit - totalCredit; // Veya alacak - borç, iş mantığınıza göre

      res.json({ ...account, totalDebit, totalCredit, balance });
    } catch (error: any) {
      console.error(`Cari hesap ${req.params.id} detayları alınırken hata:`, error);
      res.status(500).json({ message: "Cari hesap detayları alınırken bir sunucu hatası oluştu." });
    }
  });

  app.put("/api/accounts/:id", async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.id);
      if (isNaN(accountId)) {
        return res.status(400).json({ message: "Geçersiz hesap ID." });
      }
      const accountData = insertAccountSchema.parse(req.body);
      const updatedAccount = await storage.updateAccount(accountId, accountData);
      if (!updatedAccount) {
        return res.status(404).json({ message: "Güncellenecek cari hesap bulunamadı." });
      }
      res.json(updatedAccount);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz cari hesap bilgileri.", errors: error.format() });
      }
      console.error(`Cari hesap ${req.params.id} güncellenirken hata:`, error);
      res.status(500).json({ message: "Cari hesap güncellenirken bir sunucu hatası oluştu." });
    }
  });

  app.delete("/api/accounts/:id", async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.id);
      if (isNaN(accountId)) {
        return res.status(400).json({ message: "Geçersiz hesap ID." });
      }
      const success = await storage.deleteAccount(accountId);
      if (!success) {
        // storage.deleteAccount her zaman true dönüyorsa bu bloğa girmez.
        // Gerçek veritabanı işlemlerinde silme işleminin sonucuna göre kontrol edin.
        return res.status(404).json({ message: "Silinecek cari hesap bulunamadı." });
      }
      res.status(204).send(); // Başarılı silme işleminde içerik dönülmez
    } catch (error: any) {
      console.error(`Cari hesap ${req.params.id} silinirken hata:`, error);
      res.status(500).json({ message: "Cari hesap silinirken bir sunucu hatası oluştu." });
    }
  });

  // Hesap Hareketleri Rotaları
  app.get("/api/accounts/:id/transactions", async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.id);
      if (isNaN(accountId)) {
        return res.status(400).json({ message: "Geçersiz hesap ID." });
      }
      const transactions = await storage.getTransactionsByAccount(accountId);
      // Bakiye hesaplama (her hareket sonrası)
      let currentBalance = 0;
      const transactionsWithBalance = transactions
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Tarihe göre sırala
        .map(transaction => {
          if (transaction.type === 'debit') { // Borç
            currentBalance += Number(transaction.amount);
          } else { // Alacak
            currentBalance -= Number(transaction.amount);
          }
          return { ...transaction, balance: currentBalance };
        });
      res.json(transactionsWithBalance);
    } catch (error: any) {
      console.error(`Hesap ${req.params.id} hareketleri alınırken hata:`, error);
      res.status(500).json({ message: "Hesap hareketleri alınırken bir sunucu hatası oluştu." });
    }
  });

  // Hesap Projeleri Rotaları
  app.get("/api/accounts/:id/projects", async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.id);
      if (isNaN(accountId)) {
        return res.status(400).json({ message: "Geçersiz hesap ID." });
      }
      const projects = await storage.getProjectsByAccount(accountId);
      const formattedProjects = projects.map(project => ({
        ...project,
        startDate: format(new Date(project.startDate), 'dd.MM.yyyy'),
        endDate: project.endDate ? format(new Date(project.endDate), 'dd.MM.yyyy') : '-', // Türkçe
        amount: project.amount ? `₺${Number(project.amount).toFixed(2)}` : '-' // Türkçe
      }));
      res.json(formattedProjects);
    } catch (error: any) {
      console.error(`Hesap ${req.params.id} projeleri alınırken hata:`, error);
      res.status(500).json({ message: "Hesaba ait projeler alınırken bir sunucu hatası oluştu." });
    }
  });

  // Hesap Teklifleri Rotaları
  app.get("/api/accounts/:id/quotes", async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.id);
      if (isNaN(accountId)) {
        return res.status(400).json({ message: "Geçersiz hesap ID." });
      }
      const quotes = await storage.getQuotesByAccount(accountId);
      const formattedQuotes = quotes.map(quote => ({
        ...quote,
        date: format(new Date(quote.date), 'dd.MM.yyyy'),
        amount: `₺${Number(quote.totalAmount).toFixed(2)}` // Türkçe
      }));
      res.json(formattedQuotes);
    } catch (error: any) {
      console.error(`Hesap ${req.params.id} teklifleri alınırken hata:`, error);
      res.status(500).json({ message: "Hesaba ait teklifler alınırken bir sunucu hatası oluştu." });
    }
  });

  // Hesap Görevleri Rotaları
  app.get("/api/accounts/:id/tasks", async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.id);
      if (isNaN(accountId)) {
        return res.status(400).json({ message: "Geçersiz hesap ID." });
      }
      const tasks = await storage.getTasksByAccount(accountId);
      const projects = await storage.getProjects(); // Proje isimleri için
      const formattedTasks = tasks.map(task => {
        const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
        return {
          ...task,
          dueDate: task.dueDate ? format(new Date(task.dueDate), 'dd.MM.yyyy') : '-', // Türkçe
          project: project?.name || '-', // Türkçe
          status: task.status === 'todo' ? 'Beklemede' : task.status === 'in-progress' ? 'Devam Ediyor' : 'Tamamlandı', // Türkçe
          assignee: task.assigneeId ? `Kullanıcı ${task.assigneeId}` : 'Atanmamış' // Örnek, gerçek kullanıcı adı getirilmeli
        };
      });
      res.json(formattedTasks);
    } catch (error: any) {
      console.error(`Hesap ${req.params.id} görevleri alınırken hata:`, error);
      res.status(500).json({ message: "Hesaba ait görevler alınırken bir sunucu hatası oluştu." });
    }
  });

  // İşlem (Transaction) Rotaları
  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz işlem bilgileri.", errors: error.format() });
      }
      console.error("İşlem oluşturulurken hata:", error);
      res.status(500).json({ message: "İşlem oluşturulurken bir sunucu hatası oluştu." });
    }
  });

  // Teklif Rotaları
  app.get("/api/quotes", async (req: Request, res: Response) => {
    try {
      const quotes = await storage.getQuotes();
      const accounts = await storage.getAccounts();
      const formattedQuotes = quotes.map(quote => {
        const account = accounts.find(a => a.id === quote.accountId);
        return {
          ...quote,
          accountName: account?.name || 'Bilinmeyen Hesap', // Türkçe
          formattedDate: format(new Date(quote.date), 'dd.MM.yyyy')
        };
      });
      res.json(formattedQuotes);
    } catch (error: any) {
      console.error("Teklifler alınırken hata:", error);
      res.status(500).json({ message: "Teklifler alınırken bir sunucu hatası oluştu." });
    }
  });

  app.post("/api/quotes", async (req: Request, res: Response) => {
    try {
      // req.body.items tipini belirtmek için geçici bir tip tanımı
      type RequestBodyWithItems = z.infer<typeof insertQuoteSchema> & { items?: InsertQuoteItem[] };
      const parsedBody = insertQuoteSchema.extend({ items: z.array(insertQuoteItemSchema.omit({quoteId: true})).optional() }).parse(req.body) as RequestBodyWithItems;

      const { items, ...quoteData } = parsedBody;
      const quote = await storage.createQuote(quoteData);

      if (items && Array.isArray(items)) {
        for (const item of items) {
          // item'ın tipini InsertQuoteItem olarak belirtiyoruz
          const quoteItemData: InsertQuoteItem = {
            ...item,
            quoteId: quote.id, // quoteId'yi burada ekliyoruz
          };
          await storage.createQuoteItem(quoteItemData);
        }
      }
      res.status(201).json(quote);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz teklif bilgileri.", errors: error.format() });
      }
      console.error("Teklif oluşturulurken hata:", error);
      res.status(500).json({ message: "Teklif oluşturulurken bir sunucu hatası oluştu." });
    }
  });

  app.get("/api/quotes/:id", async (req: Request, res: Response) => {
    try {
      const quoteId = parseInt(req.params.id);
      if (isNaN(quoteId)) {
        return res.status(400).json({ message: "Geçersiz teklif ID." });
      }
      const quote = await storage.getQuote(quoteId);
      if (!quote) {
        return res.status(404).json({ message: "Teklif bulunamadı." });
      }
      const account = await storage.getAccount(quote.accountId);
      const quoteItems = await storage.getQuoteItems(quoteId);
      res.json({
        ...quote,
        account,
        items: quoteItems,
        formattedDate: format(new Date(quote.date), 'dd.MM.yyyy'),
        formattedValidUntil: quote.validUntil ? format(new Date(quote.validUntil), 'dd.MM.yyyy') : '-' // Türkçe
      });
    } catch (error: any) {
      console.error(`Teklif ${req.params.id} detayları alınırken hata:`, error);
      res.status(500).json({ message: "Teklif detayları alınırken bir sunucu hatası oluştu." });
    }
  });

  app.put("/api/quotes/:id", async (req: Request, res: Response) => {
    try {
      const quoteId = parseInt(req.params.id);
      if (isNaN(quoteId)) {
        return res.status(400).json({ message: "Geçersiz teklif ID." });
      }
      // req.body.items tipini belirtmek için geçici bir tip tanımı
      type RequestBodyWithItems = z.infer<typeof insertQuoteSchema> & { items?: (Partial<QuoteItem> & { id?: number })[] };
      const parsedBody = insertQuoteSchema.extend({ items: z.array(insertQuoteItemSchema.omit({quoteId: true}).partial().extend({id: z.number().optional()})).optional() }).parse(req.body) as RequestBodyWithItems;

      const { items, ...quoteData } = parsedBody;
      const updatedQuote = await storage.updateQuote(quoteId, quoteData);

      if (!updatedQuote) {
        return res.status(404).json({ message: "Güncellenecek teklif bulunamadı." });
      }

      if (items && Array.isArray(items)) {
        const existingItems = await storage.getQuoteItems(quoteId);
        const updatedItemIds: number[] = [];

        for (const item of items) {
          if (item.id) { // Var olan kalem güncelleniyor
            await storage.updateQuoteItem(item.id, item as Partial<InsertQuoteItem>); // Tip dönüşümü
            updatedItemIds.push(item.id);
          } else { // Yeni kalem ekleniyor
            const newItem = await storage.createQuoteItem({ ...item, quoteId } as InsertQuoteItem); // Tip dönüşümü
            if (newItem && newItem.id) { // newItem ve newItem.id'nin varlığını kontrol et
              updatedItemIds.push(newItem.id);
            }
          }
        }
        // Silinmiş kalemleri bul ve sil
        for (const existingItem of existingItems) {
          if (!updatedItemIds.includes(existingItem.id)) {
            await storage.deleteQuoteItem(existingItem.id);
          }
        }
      }
      res.json(updatedQuote);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz teklif bilgileri.", errors: error.format() });
      }
      console.error(`Teklif ${req.params.id} güncellenirken hata:`, error);
      res.status(500).json({ message: "Teklif güncellenirken bir sunucu hatası oluştu." });
    }
  });

  app.delete("/api/quotes/:id", async (req: Request, res: Response) => {
    try {
      const quoteId = parseInt(req.params.id);
      if (isNaN(quoteId)) {
        return res.status(400).json({ message: "Geçersiz teklif ID." });
      }
      // Önce ilişkili kalemleri sil
      const quoteItems = await storage.getQuoteItems(quoteId);
      for (const item of quoteItems) {
        await storage.deleteQuoteItem(item.id);
      }
      const success = await storage.deleteQuote(quoteId);
      if (!success) {
        return res.status(404).json({ message: "Silinecek teklif bulunamadı." });
      }
      res.status(204).send();
    } catch (error: any) {
      console.error(`Teklif ${req.params.id} silinirken hata:`, error);
      res.status(500).json({ message: "Teklif silinirken bir sunucu hatası oluştu." });
    }
  });

  // Proje Rotaları
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      const projects = await storage.getProjects();
      const accounts = await storage.getAccounts();
      const formattedProjects = projects.map(project => {
        const account = accounts.find(a => a.id === project.accountId);
        return {
          ...project,
          accountName: account?.name || 'Bilinmeyen Hesap', // Türkçe
          formattedStartDate: format(new Date(project.startDate), 'dd.MM.yyyy'),
          formattedEndDate: project.endDate ? format(new Date(project.endDate), 'dd.MM.yyyy') : '-' // Türkçe
        };
      });
      res.json(formattedProjects);
    } catch (error: any) {
      console.error("Projeler alınırken hata:", error);
      res.status(500).json({ message: "Projeler alınırken bir sunucu hatası oluştu." });
    }
  });

  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);

      // Proje tutarı varsa işlem oluştur
      if (projectData.amount && Number(projectData.amount) > 0) { // String ise Number'a çevir
        const account = await storage.getAccount(projectData.accountId);
        if (account) {
          await storage.createTransaction({
            accountId: account.id,
            date: new Date(),
            description: `Proje No: ${project.number} - ${project.name}`,
            type: 'debit', // Proje bedeli genellikle borç olarak kaydedilir
            amount: Number(projectData.amount), // Number'a çevir
            projectId: project.id,
            quoteId: projectData.quoteId || null
          });
        }
      }
      res.status(201).json(project);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz proje bilgileri.", errors: error.format() });
      }
      console.error("Proje oluşturulurken hata:", error);
      res.status(500).json({ message: "Proje oluşturulurken bir sunucu hatası oluştu." });
    }
  });

  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Geçersiz proje ID." });
      }
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Proje bulunamadı." });
      }
      const account = await storage.getAccount(project.accountId);
      const tasks = await storage.getTasksByProject(projectId);
      const formattedTasks = tasks.map(task => ({
        ...task,
        formattedDueDate: task.dueDate ? format(new Date(task.dueDate), 'dd.MM.yyyy') : '-', // Türkçe
        statusText: task.status === 'todo' ? 'Beklemede' : task.status === 'in-progress' ? 'Devam Ediyor' : 'Tamamlandı', // Türkçe
        priorityText: task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük', // Türkçe
        assignee: task.assigneeId ? `Kullanıcı ${task.assigneeId}` : 'Atanmamış' // Örnek
      }));
      res.json({
        ...project,
        account,
        tasks: formattedTasks,
        formattedStartDate: format(new Date(project.startDate), 'dd.MM.yyyy'),
        formattedEndDate: project.endDate ? format(new Date(project.endDate), 'dd.MM.yyyy') : '-' // Türkçe
      });
    } catch (error: any) {
      console.error(`Proje ${req.params.id} detayları alınırken hata:`, error);
      res.status(500).json({ message: "Proje detayları alınırken bir sunucu hatası oluştu." });
    }
  });

  app.put("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Geçersiz proje ID." });
      }
      const projectData = insertProjectSchema.parse(req.body);
      const updatedProject = await storage.updateProject(projectId, projectData);
      if (!updatedProject) {
        return res.status(404).json({ message: "Güncellenecek proje bulunamadı." });
      }
      res.json(updatedProject);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz proje bilgileri.", errors: error.format() });
      }
      console.error(`Proje ${req.params.id} güncellenirken hata:`, error);
      res.status(500).json({ message: "Proje güncellenirken bir sunucu hatası oluştu." });
    }
  });

  app.delete("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Geçersiz proje ID." });
      }
      const success = await storage.deleteProject(projectId);
      if (!success) {
        return res.status(404).json({ message: "Silinecek proje bulunamadı." });
      }
      res.status(204).send();
    } catch (error: any) {
      console.error(`Proje ${req.params.id} silinirken hata:`, error);
      res.status(500).json({ message: "Proje silinirken bir sunucu hatası oluştu." });
    }
  });

  // Görev Rotaları
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const tasks = await storage.getTasks();
      const projects = await storage.getProjects();
      const accounts = await storage.getAccounts();
      const formattedTasks = tasks.map(task => {
        const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
        const account = task.accountId ? accounts.find(a => a.id === task.accountId) : (project?.accountId ? accounts.find(a => a.id === project.accountId) : null);
        return {
          ...task,
          project: project?.name || '-', // Türkçe
          account: account?.name || '-', // Türkçe
          formattedDueDate: task.dueDate ? format(new Date(task.dueDate), 'dd.MM.yyyy') : '-', // Türkçe
          assignee: task.assigneeId ? `Kullanıcı ${task.assigneeId}` : 'Atanmamış' // Örnek
        };
      });
      res.json(formattedTasks);
    } catch (error: any) {
      console.error("Görevler alınırken hata:", error);
      res.status(500).json({ message: "Görevler alınırken bir sunucu hatası oluştu." });
    }
  });

  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz görev bilgileri.", errors: error.format() });
      }
      console.error("Görev oluşturulurken hata:", error);
      res.status(500).json({ message: "Görev oluşturulurken bir sunucu hatası oluştu." });
    }
  });

  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Geçersiz görev ID." });
      }
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Görev bulunamadı." });
      }
      res.json(task);
    } catch (error: any) {
      console.error(`Görev ${req.params.id} detayları alınırken hata:`, error);
      res.status(500).json({ message: "Görev detayları alınırken bir sunucu hatası oluştu." });
    }
  });

  app.put("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Geçersiz görev ID." });
      }
      const taskData = insertTaskSchema.parse(req.body);
      const updatedTask = await storage.updateTask(taskId, taskData);
      if (!updatedTask) {
        return res.status(404).json({ message: "Güncellenecek görev bulunamadı." });
      }
      res.json(updatedTask);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz görev bilgileri.", errors: error.format() });
      }
      console.error(`Görev ${req.params.id} güncellenirken hata:`, error);
      res.status(500).json({ message: "Görev güncellenirken bir sunucu hatası oluştu." });
    }
  });

  app.put("/api/tasks/:id/status", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Geçersiz görev ID." });
      }
      const schema = z.object({
        status: z.enum(['todo', 'in-progress', 'completed'])
      });
      const { status } = schema.parse(req.body);
      const updatedTask = await storage.updateTaskStatus(taskId, status);
      if (!updatedTask) {
        return res.status(404).json({ message: "Durumu güncellenecek görev bulunamadı." });
      }
      res.json(updatedTask);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz durum bilgisi.", errors: error.format() });
      }
      console.error(`Görev ${req.params.id} durumu güncellenirken hata:`, error);
      res.status(500).json({ message: "Görev durumu güncellenirken bir sunucu hatası oluştu." });
    }
  });

  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Geçersiz görev ID." });
      }
      const success = await storage.deleteTask(taskId);
      if (!success) {
        return res.status(404).json({ message: "Silinecek görev bulunamadı." });
      }
      res.status(204).send();
    } catch (error: any) {
      console.error(`Görev ${req.params.id} silinirken hata:`, error);
      res.status(500).json({ message: "Görev silinirken bir sunucu hatası oluştu." });
    }
  });

  // Kimlik Doğrulama Rotaları
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        username: z.string().min(1, "Kullanıcı adı gerekli."), // Türkçe
        password: z.string().min(1, "Şifre gerekli.") // Türkçe
      });
      const { username, password: plainPassword } = schema.parse(req.body);
      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı." }); // Türkçe
      }
      // Şifreleri güvenli bir şekilde karşılaştır
      const isPasswordMatch = await bcrypt.compare(plainPassword, user.password);
      if (!isPasswordMatch) {
        return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı." }); // Türkçe
      }
      const { password: _, ...userWithoutPassword } = user; // Şifreyi yanıttan çıkar
      res.json({
        user: userWithoutPassword,
        token: "ornek-jwt-token" // Gerçek bir uygulamada JWT oluşturulmalı
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz giriş bilgileri.", errors: error.format() });
      }
      console.error("Giriş yapılırken hata:", error);
      res.status(500).json({ message: "Giriş yapılırken bir sunucu hatası oluştu." });
    }
  });

  app.get("/api/profile", async (req: Request, res: Response) => {
    try {
      // Gerçek bir uygulamada JWT doğrulanmalı ve kullanıcı ID'si alınmalı
      // Şimdilik örnek bir kullanıcı ID'si (1) kullanılıyor.
      // Bu kısım gerçek kimlik doğrulama mekanizmanızla güncellenmeli.
      const userIdFromToken = 1; // Örnek: Token'dan gelen kullanıcı ID'si
      const user = await storage.getUser(userIdFromToken);
      if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı." }); // Türkçe
      }
      const { password, ...userWithoutPassword } = user; // Şifreyi yanıttan çıkar
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Profil bilgileri alınırken hata:", error);
      res.status(500).json({ message: "Profil bilgileri alınırken bir sunucu hatası oluştu." });
    }
  });

  // PDF Rotaları
  app.get("/api/quotes/:id/pdf", async (req: Request, res: Response) => {
    try {
      const quoteId = parseInt(req.params.id);
      if (isNaN(quoteId)) {
        return res.status(400).json({ message: "Geçersiz teklif ID." });
      }
      const quote = await storage.getQuote(quoteId);
      if (!quote) {
        return res.status(404).json({ message: "Teklif bulunamadı." });
      }
      const account = await storage.getAccount(quote.accountId);
      const quoteItems = await storage.getQuoteItems(quoteId);
      const quoteData = {
        ...quote,
        account,
        items: quoteItems,
        formattedDate: format(new Date(quote.date), 'dd.MM.yyyy'),
        formattedValidUntil: quote.validUntil ? format(new Date(quote.validUntil), 'dd.MM.yyyy') : '-' // Türkçe
      };
      const pdfBuffer = await generatePdfQuote(quoteData); // Bu fonksiyonun var olduğundan emin olun
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="teklif-${quote.number}.pdf"`); // Türkçe
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error(`Teklif ${req.params.id} PDF oluşturulurken hata:`, error);
      res.status(500).json({ message: "PDF oluşturulurken bir sunucu hatası oluştu." });
    }
  });

  // Rapor Rotaları
  app.get("/api/reports/financial", async (req: Request, res: Response) => {
    try {
      const transactions = await storage.getTransactions();
      const now = new Date();
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now);
        d.setMonth(now.getMonth() - 5 + i); // Son 6 ayı al
        return new Date(d.getFullYear(), d.getMonth(), 1);
      });

      const monthlyData = months.map(month => {
        const monthName = format(month, 'MMMM yyyy', { locale: tr }); // Türkçe ay adı
        const monthTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate.getMonth() === month.getMonth() && tDate.getFullYear() === month.getFullYear();
        });
        const incomeTotal = monthTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount), 0);
        const expenseTotal = monthTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + Number(t.amount), 0);
        return { month: monthName, income: incomeTotal, expense: expenseTotal, profit: incomeTotal - expenseTotal };
      });
      res.json(monthlyData);
    } catch (error: any) {
      console.error("Finansal rapor oluşturulurken hata:", error);
      res.status(500).json({ message: "Finansal rapor oluşturulurken bir sunucu hatası oluştu." });
    }
  });

  app.get("/api/reports/projects", async (req: Request, res: Response) => {
    try {
      const projects = await storage.getProjects();
      const statusCounts = projects.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {} as Record<Project['status'], number>); // Tip belirleme
      res.json({ statusCounts, projects });
    } catch (error: any) {
      console.error("Projeler raporu oluşturulurken hata:", error);
      res.status(500).json({ message: "Projeler raporu oluşturulurken bir sunucu hatası oluştu." });
    }
  });

  app.get("/api/reports/quotes", async (req: Request, res: Response) => {
    try {
      const quotes = await storage.getQuotes();
      const statusCounts = quotes.reduce((acc, q) => {
        acc[q.status] = (acc[q.status] || 0) + 1;
        return acc;
      }, {} as Record<Quote['status'], number>); // Tip belirleme

      const totalAmounts = quotes.reduce((acc, q) => {
        acc[q.status] = (acc[q.status] || 0) + Number(q.totalAmount);
        return acc;
      }, {} as Record<Quote['status'], number>); // Tip belirleme

      res.json({ statusCounts, totalAmounts, quotes });
    } catch (error: any) {
      console.error("Teklifler raporu oluşturulurken hata:", error);
      res.status(500).json({ message: "Teklifler raporu oluşturulurken bir sunucu hatası oluştu." });
    }
  });

  return httpServer;
}
