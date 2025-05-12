import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { generatePdfQuote } from "./utils/pdf";
import { 
  insertUserSchema, 
  insertAccountSchema, 
  insertTransactionSchema, 
  insertQuoteSchema, 
  insertQuoteItemSchema, 
  insertProjectSchema, 
  insertTaskSchema,
  users as usersTable
} from "@shared/schema";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // API Routes
  
  // User routes
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const allUsers = await storage.getUsers();
      res.json(allUsers.map(({ password, ...userWithoutPassword }) => userWithoutPassword)); // Exclude passwords
    } catch (error) {
      res.status(500).json({ message: "Kullanıcılar alınırken bir hata oluştu" });
    }
  });

  // User routes
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = newUser; // Exclude password from response
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Geçersiz kullanıcı bilgileri", errors: error.errors });
      } else {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Kullanıcı oluşturulurken bir hata oluştu" });
      }
    }
  });
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const accounts = await storage.getAccounts();
      const quotes = await storage.getQuotes();
      const projects = await storage.getProjects();
      const tasks = await storage.getTasks();
      const transactions = await storage.getTransactions();
      
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const pendingQuotes = quotes.filter(q => q.status === 'pending').length;
      
      const openTasks = tasks.filter(t => t.status !== 'completed').length;
      
      const creditTotal = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const debitTotal = transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const balance = creditTotal - debitTotal;
      
      res.json({
        activeProjects,
        pendingQuotes,
        openTasks,
        receivables: balance
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard stats" });
    }
  });
  
  app.get("/api/dashboard/activities", async (req: Request, res: Response) => {
    try {
      // Combine activities from quotes, projects, tasks, transactions
      const quotes = (await storage.getQuotes())
        .map(q => ({
          id: `quote-${q.id}`,
          type: 'quote',
          title: 'Yeni teklif oluşturuldu',
          description: `${q.subject} için yeni bir teklif oluşturuldu`,
          date: q.createdAt,
          relatedId: q.id
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching activities" });
    }
  });
  
  app.get("/api/dashboard/upcoming-tasks", async (req: Request, res: Response) => {
    try {
      const allTasks = await storage.getTasks();
      
      const upcomingTasks = allTasks
        .filter(task => task.status !== 'completed' && task.dueDate)
        .sort((a, b) => 
          a.dueDate && b.dueDate 
            ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            : 0
        )
        .slice(0, 5);
      
      res.json(upcomingTasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching upcoming tasks" });
    }
  });
  
  app.get("/api/dashboard/active-projects", async (req: Request, res: Response) => {
    try {
      const projects = await storage.getProjects();
      const accounts = await storage.getAccounts();
      
      const activeProjects = projects
        .filter(project => project.status === 'active')
        .sort((a, b) => 
          a.endDate && b.endDate 
            ? new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
            : 0
        )
        .slice(0, 5)
        .map(project => {
          const account = accounts.find(a => a.id === project.accountId);
          return {
            ...project,
            accountName: account?.name || 'Unknown'
          };
        });
      
      res.json(activeProjects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching active projects" });
    }
  });
  
  app.get("/api/dashboard/recent-quotes", async (req: Request, res: Response) => {
    try {
      const quotes = await storage.getQuotes();
      const accounts = await storage.getAccounts();
      
      const recentQuotes = quotes
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map(quote => {
          const account = accounts.find(a => a.id === quote.accountId);
          return {
            ...quote,
            accountName: account?.name || 'Unknown',
            formattedDate: format(new Date(quote.date), 'd MMMM', { locale: tr })
          };
        });
      
      res.json(recentQuotes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recent quotes" });
    }
  });

  // Accounts routes
  app.get("/api/accounts", async (req: Request, res: Response) => {
    try {
      const accounts = await storage.getAccounts();
      
      // Get counts for each account
      const projectsByAccount = await Promise.all(
        accounts.map(async account => {
          const projects = await storage.getProjectsByAccount(account.id);
          return projects.length;
        })
      );
      
      const tasksByAccount = await Promise.all(
        accounts.map(async account => {
          const tasks = await storage.getTasksByAccount(account.id);
          return tasks.length;
        })
      );
      
      const accountsWithCounts = accounts.map((account, index) => ({
        ...account,
        projects: projectsByAccount[index],
        tasks: tasksByAccount[index]
      }));
      
      res.json(accountsWithCounts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching accounts" });
    }
  });
  
  app.post("/api/accounts", async (req: Request, res: Response) => {
    try {
      const accountData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      res.status(400).json({ message: "Invalid account data" });
    }
  });
  
  app.get("/api/accounts/:id", async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.id);
      const account = await storage.getAccount(accountId);
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Calculate account balance
      const transactions = await storage.getTransactionsByAccount(accountId);
      
      const totalDebt = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const totalCredit = transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const balance = totalDebt - totalCredit;
      
      res.json({
        ...account,
        totalDebt,
        totalCredit,
        balance
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching account" });
    }
  });
  
  app.put("/api/accounts/:id", async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.id);
      const accountData = insertAccountSchema.parse(req.body);
      const updatedAccount = await storage.updateAccount(accountId, accountData);
      
      if (!updatedAccount) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      res.json(updatedAccount);
    } catch (error) {
      res.status(400).json({ message: "Invalid account data" });
    }
  });
  
  app.delete("/api/accounts/:id", async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.id);
      const success = await storage.deleteAccount(accountId);
      
      if (!success) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting account" });
    }
  });
  
  app.get("/api/accounts/:id/transactions", async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.id);
      const transactions = await storage.getTransactionsByAccount(accountId);
      
      // Calculate running balance
      let balance = 0;
      const transactionsWithBalance = transactions
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(transaction => {
          if (transaction.type === 'debit') {
            balance += Number(transaction.amount);
          } else {
            balance -= Number(transaction.amount);
          }
          
          return {
            ...transaction,
            balance
          };
        });
      
      res.json(transactionsWithBalance);
    } catch (error) {
      res.status(500).json({ message: "Error fetching transactions" });
    }
  });
  
  app.get("/api/accounts/:id/projects", async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.id);
      const projects = await storage.getProjectsByAccount(accountId);
      
      const formattedProjects = projects.map(project => ({
        ...project,
        startDate: format(new Date(project.startDate), 'dd.MM.yyyy'),
        endDate: project.endDate ? format(new Date(project.endDate), 'dd.MM.yyyy') : null,
        amount: project.amount ? `₺${project.amount}` : null
      }));
      
      res.json(formattedProjects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching projects" });
    }
  });
  
  app.get("/api/accounts/:id/quotes", async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.id);
      const quotes = await storage.getQuotesByAccount(accountId);
      
      const formattedQuotes = quotes.map(quote => ({
        ...quote,
        date: format(new Date(quote.date), 'dd.MM.yyyy'),
        amount: `₺${quote.totalAmount}`
      }));
      
      res.json(formattedQuotes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching quotes" });
    }
  });
  
  app.get("/api/accounts/:id/tasks", async (req: Request, res: Response) => {
    try {
      const accountId = parseInt(req.params.id);
      const tasks = await storage.getTasksByAccount(accountId);
      const projects = await storage.getProjects();
      
      const formattedTasks = tasks.map(task => {
        const project = task.projectId 
          ? projects.find(p => p.id === task.projectId)
          : null;
        
        return {
          ...task,
          dueDate: task.dueDate ? format(new Date(task.dueDate), 'dd.MM.yyyy') : null,
          project: project?.name || null,
          status: task.status === 'todo' 
            ? 'Beklemede' 
            : task.status === 'in-progress' 
              ? 'Devam Ediyor'
              : 'Tamamlandı',
          assignee: 'Ahmet Şahin' // Hardcoded for simplicity
        };
      });
      
      res.json(formattedTasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks" });
    }
  });
  
  // Transactions routes
  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });
  
  // Quotes routes
  app.get("/api/quotes", async (req: Request, res: Response) => {
    try {
      const quotes = await storage.getQuotes();
      const accounts = await storage.getAccounts();
      
      const formattedQuotes = quotes.map(quote => {
        const account = accounts.find(a => a.id === quote.accountId);
        return {
          ...quote,
          accountName: account?.name || 'Unknown',
          formattedDate: format(new Date(quote.date), 'dd.MM.yyyy')
        };
      });
      
      res.json(formattedQuotes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching quotes" });
    }
  });
  
  app.post("/api/quotes", async (req: Request, res: Response) => {
    try {
      const quoteData = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(quoteData);
      
      // If there are quote items, create them as well
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          const quoteItemData = {
            ...item,
            quoteId: quote.id
          };
          await storage.createQuoteItem(quoteItemData);
        }
      }
      
      res.status(201).json(quote);
    } catch (error) {
      res.status(400).json({ message: "Invalid quote data" });
    }
  });
  
  app.get("/api/quotes/:id", async (req: Request, res: Response) => {
    try {
      const quoteId = parseInt(req.params.id);
      const quote = await storage.getQuote(quoteId);
      
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      const account = await storage.getAccount(quote.accountId);
      const quoteItems = await storage.getQuoteItems(quoteId);
      
      res.json({
        ...quote,
        account,
        items: quoteItems,
        formattedDate: format(new Date(quote.date), 'dd.MM.yyyy'),
        formattedValidUntil: quote.validUntil 
          ? format(new Date(quote.validUntil), 'dd.MM.yyyy')
          : null
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching quote" });
    }
  });
  
  app.put("/api/quotes/:id", async (req: Request, res: Response) => {
    try {
      const quoteId = parseInt(req.params.id);
      const quoteData = insertQuoteSchema.parse(req.body);
      const updatedQuote = await storage.updateQuote(quoteId, quoteData);
      
      if (!updatedQuote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      // Update quote items if provided
      if (req.body.items && Array.isArray(req.body.items)) {
        // First, get existing items
        const existingItems = await storage.getQuoteItems(quoteId);
        
        // Process each item
        for (const item of req.body.items) {
          if (item.id) {
            // Update existing item
            await storage.updateQuoteItem(item.id, item);
          } else {
            // Create new item
            const quoteItemData = {
              ...item,
              quoteId
            };
            await storage.createQuoteItem(quoteItemData);
          }
        }
        
        // Remove deleted items
        const updatedItemIds = req.body.items
          .filter(item => item.id)
          .map(item => item.id);
        
        for (const existingItem of existingItems) {
          if (!updatedItemIds.includes(existingItem.id)) {
            await storage.deleteQuoteItem(existingItem.id);
          }
        }
      }
      
      res.json(updatedQuote);
    } catch (error) {
      res.status(400).json({ message: "Invalid quote data" });
    }
  });
  
  app.delete("/api/quotes/:id", async (req: Request, res: Response) => {
    try {
      const quoteId = parseInt(req.params.id);
      
      // Delete quote items first
      const quoteItems = await storage.getQuoteItems(quoteId);
      for (const item of quoteItems) {
        await storage.deleteQuoteItem(item.id);
      }
      
      // Then delete the quote
      const success = await storage.deleteQuote(quoteId);
      
      if (!success) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting quote" });
    }
  });
  
  // Projects routes
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      const projects = await storage.getProjects();
      const accounts = await storage.getAccounts();
      
      const formattedProjects = projects.map(project => {
        const account = accounts.find(a => a.id === project.accountId);
        return {
          ...project,
          accountName: account?.name || 'Unknown',
          formattedStartDate: format(new Date(project.startDate), 'dd.MM.yyyy'),
          formattedEndDate: project.endDate 
            ? format(new Date(project.endDate), 'dd.MM.yyyy')
            : null
        };
      });
      
      res.json(formattedProjects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching projects" });
    }
  });
  
  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      
      // Create a transaction for the project if amount is provided
      if (projectData.amount && projectData.amount > 0) {
        const account = await storage.getAccount(projectData.accountId);
        
        if (account) {
          await storage.createTransaction({
            accountId: account.id,
            date: new Date(),
            description: `Proje No: ${project.number} - ${project.name}`,
            type: 'debit',
            amount: projectData.amount,
            projectId: project.id,
            quoteId: projectData.quoteId || null
          });
        }
      }
      
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });
  
  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const account = await storage.getAccount(project.accountId);
      const tasks = await storage.getTasksByProject(projectId);
      
      const formattedTasks = tasks.map(task => ({
        ...task,
        formattedDueDate: task.dueDate 
          ? format(new Date(task.dueDate), 'dd.MM.yyyy')
          : null,
        statusText: task.status === 'todo' 
          ? 'Beklemede' 
          : task.status === 'in-progress' 
            ? 'Devam Ediyor'
            : 'Tamamlandı',
        priorityText: task.priority === 'high'
          ? 'Yüksek'
          : task.priority === 'medium'
            ? 'Orta'
            : 'Düşük',
        assignee: 'Ahmet Şahin' // Hardcoded for simplicity
      }));
      
      res.json({
        ...project,
        account,
        tasks: formattedTasks,
        formattedStartDate: format(new Date(project.startDate), 'dd.MM.yyyy'),
        formattedEndDate: project.endDate 
          ? format(new Date(project.endDate), 'dd.MM.yyyy')
          : null
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching project" });
    }
  });
  
  app.put("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      const projectData = insertProjectSchema.parse(req.body);
      const updatedProject = await storage.updateProject(projectId, projectData);
      
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(updatedProject);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });
  
  app.delete("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      const success = await storage.deleteProject(projectId);
      
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting project" });
    }
  });
  
  // Tasks routes
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const tasks = await storage.getTasks();
      const projects = await storage.getProjects();
      const accounts = await storage.getAccounts();
      
      const formattedTasks = tasks.map(task => {
        const project = task.projectId 
          ? projects.find(p => p.id === task.projectId)
          : null;
        
        const account = task.accountId
          ? accounts.find(a => a.id === task.accountId)
          : project?.accountId
            ? accounts.find(a => a.id === project.accountId)
            : null;
        
        return {
          ...task,
          project: project?.name,
          account: account?.name,
          formattedDueDate: task.dueDate 
            ? format(new Date(task.dueDate), 'dd.MM.yyyy')
            : null,
          assignee: 'Ahmet Şahin' // Hardcoded for simplicity
        };
      });
      
      res.json(formattedTasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks" });
    }
  });
  
  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });
  
  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Error fetching task" });
    }
  });
  
  app.put("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const taskData = insertTaskSchema.parse(req.body);
      const updatedTask = await storage.updateTask(taskId, taskData);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });
  
  app.put("/api/tasks/:id/status", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const schema = z.object({
        status: z.enum(['todo', 'in-progress', 'completed'])
      });
      
      const { status } = schema.parse(req.body);
      const updatedTask = await storage.updateTaskStatus(taskId, status);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      res.status(400).json({ message: "Invalid status" });
    }
  });
  
  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const success = await storage.deleteTask(taskId);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting task" });
    }
  });
  
  // Auth routes
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        username: z.string(),
        password: z.string()
      });
      
      const { username, password } = schema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        token: "sample-token" // In a real app, you would generate a proper JWT
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid login data" });
    }
  });
  
  app.get("/api/profile", async (req: Request, res: Response) => {
    try {
      // In a real app, you would validate the JWT and get the user ID
      const user = await storage.getUser(1); // Using hardcoded user for now
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching profile" });
    }
  });
  
  // PDF routes
  app.get("/api/quotes/:id/pdf", async (req: Request, res: Response) => {
    try {
      const quoteId = parseInt(req.params.id);
      const quote = await storage.getQuote(quoteId);
      
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      const account = await storage.getAccount(quote.accountId);
      const quoteItems = await storage.getQuoteItems(quoteId);
      
      const quoteData = {
        ...quote,
        account,
        items: quoteItems,
        formattedDate: format(new Date(quote.date), 'dd.MM.yyyy'),
        formattedValidUntil: quote.validUntil 
          ? format(new Date(quote.validUntil), 'dd.MM.yyyy')
          : null
      };
      
      const pdfBuffer = await generatePdfQuote(quoteData);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="quote-${quote.number}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ message: "Error generating PDF" });
    }
  });
  
  // Reports routes
  app.get("/api/reports/financial", async (req: Request, res: Response) => {
    try {
      // Prepare monthly financial data for charts
      const transactions = await storage.getTransactions();
      
      // Get data for the last 6 months
      const now = new Date();
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(month);
      }
      
      const monthlyData = months.map(month => {
        const monthName = format(month, 'MMM', { locale: tr });
        const year = month.getFullYear();
        
        // Filter transactions for this month
        const monthTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate.getMonth() === month.getMonth() && tDate.getFullYear() === year;
        });
        
        const incomeTotal = monthTransactions
          .filter(t => t.type === 'credit')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const expenseTotal = monthTransactions
          .filter(t => t.type === 'debit')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        return {
          month: monthName,
          income: incomeTotal,
          expense: expenseTotal,
          profit: incomeTotal - expenseTotal
        };
      });
      
      res.json(monthlyData);
    } catch (error) {
      res.status(500).json({ message: "Error generating financial report" });
    }
  });
  
  app.get("/api/reports/projects", async (req: Request, res: Response) => {
    try {
      const projects = await storage.getProjects();
      
      // Count projects by status
      const statusCounts = {
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        cancelled: projects.filter(p => p.status === 'cancelled').length,
        on_hold: projects.filter(p => p.status === 'on_hold').length
      };
      
      res.json({
        statusCounts,
        projects
      });
    } catch (error) {
      res.status(500).json({ message: "Error generating projects report" });
    }
  });
  
  app.get("/api/reports/quotes", async (req: Request, res: Response) => {
    try {
      const quotes = await storage.getQuotes();
      
      // Count quotes by status
      const statusCounts = {
        pending: quotes.filter(q => q.status === 'pending').length,
        approved: quotes.filter(q => q.status === 'approved').length,
        rejected: quotes.filter(q => q.status === 'rejected').length,
        cancelled: quotes.filter(q => q.status === 'cancelled').length
      };
      
      // Calculate total amount by status
      const totalAmounts = {
        pending: quotes
          .filter(q => q.status === 'pending')
          .reduce((sum, q) => sum + Number(q.totalAmount), 0),
        approved: quotes
          .filter(q => q.status === 'approved')
          .reduce((sum, q) => sum + Number(q.totalAmount), 0),
        rejected: quotes
          .filter(q => q.status === 'rejected')
          .reduce((sum, q) => sum + Number(q.totalAmount), 0),
        cancelled: quotes
          .filter(q => q.status === 'cancelled')
          .reduce((sum, q) => sum + Number(q.totalAmount), 0)
      };
      
      res.json({
        statusCounts,
        totalAmounts,
        quotes
      });
    } catch (error) {
      res.status(500).json({ message: "Error generating quotes report" });
    }
  });

  return httpServer;
}
