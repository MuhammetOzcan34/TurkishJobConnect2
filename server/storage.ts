import {
  users, User, InsertUser,
  accounts, Account, InsertAccount,
  transactions, Transaction, InsertTransaction,
  quotes, Quote, InsertQuote,
  quoteItems, QuoteItem, InsertQuoteItem,
  projects, Project, InsertProject,
  tasks, Task, InsertTask,
} from "@shared/schema";
import { generateId } from "../client/src/lib/utils";

export interface IStorage {
  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Account operations
  getAccounts(): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: number): Promise<boolean>;
  
  // Transaction operations
  getTransactions(): Promise<Transaction[]>;
  getTransactionsByAccount(accountId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Quote operations
  getQuotes(): Promise<Quote[]>;
  getQuotesByAccount(accountId: number): Promise<Quote[]>;
  getQuote(id: number): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  deleteQuote(id: number): Promise<boolean>;
  
  // Quote items operations
  getQuoteItems(quoteId: number): Promise<QuoteItem[]>;
  createQuoteItem(quoteItem: InsertQuoteItem): Promise<QuoteItem>;
  updateQuoteItem(id: number, quoteItem: Partial<InsertQuoteItem>): Promise<QuoteItem | undefined>;
  deleteQuoteItem(id: number): Promise<boolean>;
  
  // Project operations
  getProjects(): Promise<Project[]>;
  getProjectsByAccount(accountId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Task operations
  getTasks(): Promise<Task[]>;
  getTasksByAccount(accountId: number): Promise<Task[]>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  updateTaskStatus(id: number, status: 'todo' | 'in-progress' | 'completed'): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private accounts: Map<number, Account>;
  private transactions: Map<number, Transaction>;
  private quotes: Map<number, Quote>;
  private quoteItems: Map<number, QuoteItem>;
  private projects: Map<number, Project>;
  private tasks: Map<number, Task>;
  
  currentUserId: number;
  currentAccountId: number;
  currentTransactionId: number;
  currentQuoteId: number;
  currentQuoteItemId: number;
  currentProjectId: number;
  currentTaskId: number;

  constructor() {
    this.users = new Map();
    this.accounts = new Map();
    this.transactions = new Map();
    this.quotes = new Map();
    this.quoteItems = new Map();
    this.projects = new Map();
    this.tasks = new Map();
    
    this.currentUserId = 1;
    this.currentAccountId = 1;
    this.currentTransactionId = 1;
    this.currentQuoteId = 1;
    this.currentQuoteItemId = 1;
    this.currentProjectId = 1;
    this.currentTaskId = 1;
    
    // Add sample user
    this.createUser({
      username: "admin",
      password: "admin123",
      name: "Ahmet Şahin",
      email: "ahmet@firma.com",
      phone: "+90 555 123 4567",
      position: "Yönetici",
      companyName: "Firma Ltd. Şti."
    });
    
    // Add sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample accounts
    const account1 = this.createAccount({
      name: "ABC Şirketi",
      type: "customer",
      branch: "İstanbul",
      contact: "Mehmet Yılmaz",
      contactTitle: "Satın Alma Müdürü",
      contactPhone: "+90 532 111 2222",
      contactEmail: "mehmet@abc.com",
      phone: "+90 212 111 2222",
      email: "info@abc.com",
      address: "İstanbul, Türkiye"
    });
    
    const account2 = this.createAccount({
      name: "XYZ Teknoloji A.Ş.",
      type: "customer",
      branch: "Ankara",
      contact: "Ayşe Kaya",
      contactTitle: "CTO",
      contactPhone: "+90 532 222 3333",
      contactEmail: "ayse@xyz.com",
      phone: "+90 312 222 3333",
      email: "info@xyz.com",
      address: "Ankara, Türkiye"
    });
    
    // Sample quotes
    const quote1 = this.createQuote({
      number: "FT00123",
      type: "sent",
      accountId: account2.id,
      subject: "Mobil Uygulama",
      date: new Date(),
      validUntil: new Date(new Date().setDate(new Date().getDate() + 30)),
      status: "approved",
      contactPerson: "Ayşe Kaya",
      paymentTerms: "50% peşin, 50% teslimatta",
      totalAmount: 78500,
      currency: "TRY"
    });
    
    const quote2 = this.createQuote({
      number: "FT00124",
      type: "sent",
      accountId: account1.id,
      subject: "Web Sitesi Yenileme",
      date: new Date(),
      validUntil: new Date(new Date().setDate(new Date().getDate() + 30)),
      status: "pending",
      contactPerson: "Mehmet Yılmaz",
      paymentTerms: "30% peşin, 70% teslimatta",
      totalAmount: 45000,
      currency: "TRY"
    });
    
    // Sample projects
    const project1 = this.createProject({
      number: "P0001",
      name: "E-ticaret Platformu",
      accountId: account1.id,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 60)),
      status: "active",
      description: "Kapsamlı e-ticaret platformu geliştirme projesi",
      amount: 65000,
      currency: "TRY"
    });
    
    const project2 = this.createProject({
      number: "P0002",
      name: "Mobil Uygulama Geliştirme",
      accountId: account2.id,
      quoteId: quote1.id,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 90)),
      status: "active",
      description: "iOS ve Android mobil uygulama geliştirme projesi",
      amount: 78500,
      currency: "TRY"
    });
    
    const project3 = this.createProject({
      number: "P0003",
      name: "Kurumsal Web Sitesi",
      accountId: account2.id,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 45)),
      status: "active",
      description: "Kurumsal web sitesi yenileme projesi",
      amount: 35000,
      currency: "TRY"
    });
    
    // Sample tasks
    this.createTask({
      title: "Tasarım sunumu hazırla",
      description: "XYZ Projesi için tasarım sunumu hazırlanacak",
      status: "todo",
      priority: "high",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      projectId: project2.id,
      accountId: account2.id,
      assigneeId: 1,
      createdById: 1
    });
    
    this.createTask({
      title: "Teklif revizyonu",
      description: "ABC Müşterisi için teklif revizyonu yapılacak",
      status: "todo",
      priority: "medium",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
      accountId: account1.id,
      assigneeId: 1,
      createdById: 1
    });
    
    this.createTask({
      title: "Proje toplantısı",
      description: "Mobil Uygulama Ekibi ile haftalık proje toplantısı",
      status: "todo",
      priority: "medium",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
      projectId: project2.id,
      assigneeId: 1,
      createdById: 1
    });
    
    this.createTask({
      title: "Müşteri görüşmesi",
      description: "Yeni Proje Değerlendirmesi için müşteri görüşmesi",
      status: "todo",
      priority: "low",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 4)),
      assigneeId: 1,
      createdById: 1
    });
    
    // Sample transactions
    this.createTransaction({
      accountId: account1.id,
      date: new Date(new Date().setDate(new Date().getDate() - 10)),
      description: `Proje No: ${project1.number} - ${project1.name}`,
      type: "debit",
      amount: 65000,
      projectId: project1.id
    });
    
    this.createTransaction({
      accountId: account1.id,
      date: new Date(new Date().setDate(new Date().getDate() - 5)),
      description: "İlk Ödeme",
      type: "credit",
      amount: 32500
    });
    
    this.createTransaction({
      accountId: account2.id,
      date: new Date(new Date().setDate(new Date().getDate() - 15)),
      description: `Proje No: ${project2.number} - ${project2.name}`,
      type: "debit",
      amount: 78500,
      projectId: project2.id,
      quoteId: quote1.id
    });
    
    this.createTransaction({
      accountId: account2.id,
      date: new Date(new Date().setDate(new Date().getDate() - 2)),
      description: "İlk Ödeme",
      type: "credit",
      amount: 39250
    });
  }

  // User operations
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  // Account operations
  async getAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }
  
  async getAccount(id: number): Promise<Account | undefined> {
    return this.accounts.get(id);
  }
  
  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = this.currentAccountId++;
    const now = new Date();
    const account: Account = {
      ...insertAccount,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.accounts.set(id, account);
    return account;
  }
  
  async updateAccount(id: number, accountData: Partial<InsertAccount>): Promise<Account | undefined> {
    const account = this.accounts.get(id);
    if (!account) return undefined;
    
    const updatedAccount: Account = {
      ...account,
      ...accountData,
      updatedAt: new Date()
    };
    
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }
  
  async deleteAccount(id: number): Promise<boolean> {
    return this.accounts.delete(id);
  }
  
  // Transaction operations
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }
  
  async getTransactionsByAccount(accountId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.accountId === accountId);
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const now = new Date();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  // Quote operations
  async getQuotes(): Promise<Quote[]> {
    return Array.from(this.quotes.values());
  }
  
  async getQuotesByAccount(accountId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values())
      .filter(quote => quote.accountId === accountId);
  }
  
  async getQuote(id: number): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }
  
  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = this.currentQuoteId++;
    const now = new Date();
    
    // Generate a quote number if not provided
    const quoteNumber = insertQuote.number || (
      insertQuote.type === 'sent' 
        ? `FT${String(id).padStart(5, '0')}` 
        : `ST${String(id).padStart(5, '0')}`
    );
    
    const quote: Quote = {
      ...insertQuote,
      number: quoteNumber,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.quotes.set(id, quote);
    return quote;
  }
  
  async updateQuote(id: number, quoteData: Partial<InsertQuote>): Promise<Quote | undefined> {
    const quote = this.quotes.get(id);
    if (!quote) return undefined;
    
    const updatedQuote: Quote = {
      ...quote,
      ...quoteData,
      updatedAt: new Date()
    };
    
    this.quotes.set(id, updatedQuote);
    return updatedQuote;
  }
  
  async deleteQuote(id: number): Promise<boolean> {
    return this.quotes.delete(id);
  }
  
  // Quote items operations
  async getQuoteItems(quoteId: number): Promise<QuoteItem[]> {
    return Array.from(this.quoteItems.values())
      .filter(item => item.quoteId === quoteId);
  }
  
  async createQuoteItem(insertQuoteItem: InsertQuoteItem): Promise<QuoteItem> {
    const id = this.currentQuoteItemId++;
    const now = new Date();
    const quoteItem: QuoteItem = {
      ...insertQuoteItem,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.quoteItems.set(id, quoteItem);
    return quoteItem;
  }
  
  async updateQuoteItem(id: number, quoteItemData: Partial<InsertQuoteItem>): Promise<QuoteItem | undefined> {
    const quoteItem = this.quoteItems.get(id);
    if (!quoteItem) return undefined;
    
    const updatedQuoteItem: QuoteItem = {
      ...quoteItem,
      ...quoteItemData,
      updatedAt: new Date()
    };
    
    this.quoteItems.set(id, updatedQuoteItem);
    return updatedQuoteItem;
  }
  
  async deleteQuoteItem(id: number): Promise<boolean> {
    return this.quoteItems.delete(id);
  }
  
  // Project operations
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  async getProjectsByAccount(accountId: number): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.accountId === accountId);
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const now = new Date();
    
    // Generate a project number if not provided
    const projectNumber = insertProject.number || `P${String(id).padStart(4, '0')}`;
    
    const project: Project = {
      ...insertProject,
      number: projectNumber,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.projects.set(id, project);
    return project;
  }
  
  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject: Project = {
      ...project,
      ...projectData,
      updatedAt: new Date()
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }
  
  // Task operations
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }
  
  async getTasksByAccount(accountId: number): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.accountId === accountId);
  }
  
  async getTasksByProject(projectId: number): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.projectId === projectId);
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const now = new Date();
    const task: Task = {
      ...insertTask,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask: Task = {
      ...task,
      ...taskData,
      updatedAt: new Date()
    };
    
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async updateTaskStatus(id: number, status: 'todo' | 'in-progress' | 'completed'): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask: Task = {
      ...task,
      status,
      updatedAt: new Date()
    };
    
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
}

import { DatabaseStorage } from "./database-storage";

// Uncomment next line to use database storage
// export const storage = new DatabaseStorage(); 

// Comment out next line to use database storage instead of memory storage
export const storage = new MemStorage();
