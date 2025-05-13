import {
  users, User, InsertUser,
  accounts, Account, InsertAccount,
  transactions, Transaction, InsertTransaction,
  quotes, Quote, InsertQuote,
  quoteItems, QuoteItem, InsertQuoteItem,
  projects, Project, InsertProject,
  tasks, Task, InsertTask,
} from "@shared/schema";
// generateId fonksiyonu MemStorage için kullanılıyordu, DatabaseStorage için gerekli değil.
// import { generateId } from "../client/src/lib/utils"; // Bu satır kaldırılabilir veya yorumda bırakılabilir.

// IStorage arayüzü, depolama sınıflarının uygulayacağı metotları tanımlar.
export interface IStorage {
  // Kullanıcı işlemleri
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Cari Hesap işlemleri
  getAccounts(): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: number): Promise<boolean>;

  // Hesap Hareketi işlemleri
  getTransactions(): Promise<Transaction[]>;
  getTransactionsByAccount(accountId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Teklif işlemleri
  getQuotes(): Promise<Quote[]>;
  getQuotesByAccount(accountId: number): Promise<Quote[]>;
  getQuote(id: number): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  deleteQuote(id: number): Promise<boolean>;

  // Teklif Kalemi işlemleri
  getQuoteItems(quoteId: number): Promise<QuoteItem[]>;
  createQuoteItem(quoteItem: InsertQuoteItem): Promise<QuoteItem>;
  updateQuoteItem(id: number, quoteItem: Partial<InsertQuoteItem>): Promise<QuoteItem | undefined>;
  deleteQuoteItem(id: number): Promise<boolean>;

  // Proje işlemleri
  getProjects(): Promise<Project[]>;
  getProjectsByAccount(accountId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Görev işlemleri
  getTasks(): Promise<Task[]>;
  getTasksByAccount(accountId: number): Promise<Task[]>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  updateTaskStatus(id: number, status: 'todo' | 'in-progress' | 'completed'): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
}

// MemStorage sınıfı, verileri bellekte tutar (geliştirme ve test için).
// Bu sınıfın içeriği bir önceki cevaptaki gibi kalabilir, ancak production için DatabaseStorage kullanılacaktır.
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

    // Örnek kullanıcı ekle
    this.createUser({
      username: "admin",
      password: "admin123", // Gerçek uygulamada bu şifre hash'lenmeli!
      name: "Ahmet Şahin",
      email: "ahmet@firma.com",
      phone: "+90 555 123 4567",
      position: "Yönetici",
      companyName: "Firma Ltd. Şti."
    });

    // Örnek verileri başlat
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Örnek cari hesaplar
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

    // Örnek teklifler
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
      totalAmount: "78500.00", // String olarak saklanıyorsa
      currency: "TRY"
    });

    this.createQuote({
      number: "FT00124",
      type: "sent",
      accountId: account1.id,
      subject: "Web Sitesi Yenileme",
      date: new Date(),
      validUntil: new Date(new Date().setDate(new Date().getDate() + 30)),
      status: "pending",
      contactPerson: "Mehmet Yılmaz",
      paymentTerms: "30% peşin, 70% teslimatta",
      totalAmount: "45000.00",
      currency: "TRY"
    });

    // Örnek projeler
    const project1 = this.createProject({
      number: "P0001",
      name: "E-ticaret Platformu",
      accountId: account1.id,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 60)),
      status: "active",
      description: "Kapsamlı e-ticaret platformu geliştirme projesi",
      amount: "65000.00",
      currency: "TRY"
    });

    if (quote1) { // quote1'in varlığını kontrol et
        this.createProject({
            number: "P0002",
            name: "Mobil Uygulama Geliştirme",
            accountId: account2.id,
            quoteId: quote1.id, // quote1 var ise id'sini kullan
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 90)),
            status: "active",
            description: "iOS ve Android mobil uygulama geliştirme projesi",
            amount: "78500.00",
            currency: "TRY"
        });
    }


    this.createProject({
      number: "P0003",
      name: "Kurumsal Web Sitesi",
      accountId: account2.id,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 45)),
      status: "active",
      description: "Kurumsal web sitesi yenileme projesi",
      amount: "35000.00",
      currency: "TRY"
    });

    // Örnek görevler
    if (project1) { // project1'in varlığını kontrol et
        this.createTask({
            title: "Tasarım sunumu hazırla",
            description: "XYZ Projesi için tasarım sunumu hazırlanacak",
            status: "todo",
            priority: "high",
            dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
            projectId: project1.id, // project1 var ise id'sini kullan
            accountId: account2.id, // Bu ID'nin geçerli olduğundan emin olun
            assigneeId: 1, // Örnek kullanıcı ID'si
            createdById: 1 // Örnek kullanıcı ID'si
        });
    }


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
    // ... Diğer örnek görevler ...

    // Örnek hesap hareketleri
    if (project1) { // project1'in varlığını kontrol et
        this.createTransaction({
            accountId: account1.id,
            date: new Date(new Date().setDate(new Date().getDate() - 10)),
            description: `Proje No: ${project1.number} - ${project1.name}`,
            type: "debit",
            amount: "65000.00",
            projectId: project1.id
        });
    }


    this.createTransaction({
      accountId: account1.id,
      date: new Date(new Date().setDate(new Date().getDate() - 5)),
      description: "İlk Ödeme",
      type: "credit",
      amount: "32500.00"
    });
    // ... Diğer örnek hesap hareketleri ...
  }

  // Kullanıcı işlemleri
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

  // Cari Hesap işlemleri
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

  // Hesap Hareketi işlemleri
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

  // Teklif işlemleri
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

    // Teklif numarası sağlanmadıysa oluştur
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

  // Teklif Kalemi işlemleri
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

  // Proje işlemleri
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

    // Proje numarası sağlanmadıysa oluştur
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

  // Görev işlemleri
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

// Veritabanı depolama sınıfını import et
import { DatabaseStorage } from "./database-storage";

// Veritabanı depolamasını kullanmak için aşağıdaki satırın yorumunu kaldırın
export const storage: IStorage = new DatabaseStorage();

// Bellek içi depolamayı kullanmak için aşağıdaki satırın yorumunu kaldırın (ve üsttekini yorumlayın)
// export const storage: IStorage = new MemStorage();
