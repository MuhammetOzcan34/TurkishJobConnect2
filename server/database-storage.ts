import {
  users, User, InsertUser,
  accounts, Account, InsertAccount,
  transactions, Transaction, InsertTransaction,
  quotes, Quote, InsertQuote,
  quoteItems, QuoteItem, InsertQuoteItem,
  projects, Project, InsertProject,
  tasks, Task, InsertTask,
} from "@shared/schema";
import { getDb } from "./db"; // Doğrudan 'db' yerine 'getDb' fonksiyonunu import et
import { eq, and } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Veritabanı örneğini almak için yardımcı bir fonksiyon
  private getDbInstance() {
    return getDb(); // Her veritabanı işlemi öncesinde db örneğini al
  }

  // Kullanıcı işlemleri
  async getUsers(): Promise<User[]> {
    return await this.getDbInstance().select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await this.getDbInstance().select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.getDbInstance().select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.getDbInstance().insert(users).values(insertUser).returning();
    return user;
  }

  // Cari Hesap işlemleri
  async getAccounts(): Promise<Account[]> {
    return await this.getDbInstance().select().from(accounts);
  }

  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await this.getDbInstance().select().from(accounts).where(eq(accounts.id, id));
    return account;
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const [account] = await this.getDbInstance().insert(accounts).values(insertAccount).returning();
    return account;
  }

  async updateAccount(id: number, accountData: Partial<InsertAccount>): Promise<Account | undefined> {
    const [updatedAccount] = await this.getDbInstance()
      .update(accounts)
      .set(accountData)
      .where(eq(accounts.id, id))
      .returning();
    return updatedAccount;
  }

  async deleteAccount(id: number): Promise<boolean> {
    // Drizzle-ORM neon-http adaptörü genellikle etkilenen satır sayısını döndürmez.
    // Başarılı olursa hata fırlatmayacaktır.
    await this.getDbInstance().delete(accounts).where(eq(accounts.id, id));
    return true; // Hata yoksa başarılı kabul et
  }

  // Hesap Hareketi işlemleri
  async getTransactions(): Promise<Transaction[]> {
    return await this.getDbInstance().select().from(transactions);
  }

  async getTransactionsByAccount(accountId: number): Promise<Transaction[]> {
    return await this.getDbInstance()
      .select()
      .from(transactions)
      .where(eq(transactions.accountId, accountId));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await this.getDbInstance()
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  // Teklif işlemleri
  async getQuotes(): Promise<Quote[]> {
    return await this.getDbInstance().select().from(quotes);
  }

  async getQuotesByAccount(accountId: number): Promise<Quote[]> {
    return await this.getDbInstance()
      .select()
      .from(quotes)
      .where(eq(quotes.accountId, accountId));
  }

  async getQuote(id: number): Promise<Quote | undefined> {
    const [quote] = await this.getDbInstance().select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const [quote] = await this.getDbInstance().insert(quotes).values(insertQuote).returning();
    return quote;
  }

  async updateQuote(id: number, quoteData: Partial<InsertQuote>): Promise<Quote | undefined> {
    const [updatedQuote] = await this.getDbInstance()
      .update(quotes)
      .set(quoteData)
      .where(eq(quotes.id, id))
      .returning();
    return updatedQuote;
  }

  async deleteQuote(id: number): Promise<boolean> {
    await this.getDbInstance().delete(quotes).where(eq(quotes.id, id));
    return true;
  }

  // Teklif Kalemi işlemleri
  async getQuoteItems(quoteId: number): Promise<QuoteItem[]> {
    return await this.getDbInstance()
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, quoteId));
  }

  async createQuoteItem(insertQuoteItem: InsertQuoteItem): Promise<QuoteItem> {
    const [quoteItem] = await this.getDbInstance()
      .insert(quoteItems)
      .values(insertQuoteItem)
      .returning();
    return quoteItem;
  }

  async updateQuoteItem(id: number, quoteItemData: Partial<InsertQuoteItem>): Promise<QuoteItem | undefined> {
    const [updatedQuoteItem] = await this.getDbInstance()
      .update(quoteItems)
      .set(quoteItemData)
      .where(eq(quoteItems.id, id))
      .returning();
    return updatedQuoteItem;
  }

  async deleteQuoteItem(id: number): Promise<boolean> {
    await this.getDbInstance().delete(quoteItems).where(eq(quoteItems.id, id));
    return true;
  }

  // Proje işlemleri
  async getProjects(): Promise<Project[]> {
    return await this.getDbInstance().select().from(projects);
  }

  async getProjectsByAccount(accountId: number): Promise<Project[]> {
    return await this.getDbInstance()
      .select()
      .from(projects)
      .where(eq(projects.accountId, accountId));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await this.getDbInstance()
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await this.getDbInstance()
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await this.getDbInstance()
      .update(projects)
      .set(projectData)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    await this.getDbInstance().delete(projects).where(eq(projects.id, id));
    return true;
  }

  // Görev işlemleri
  async getTasks(): Promise<Task[]> {
    return await this.getDbInstance().select().from(tasks);
  }

  async getTasksByAccount(accountId: number): Promise<Task[]> {
    return await this.getDbInstance()
      .select()
      .from(tasks)
      .where(eq(tasks.accountId, accountId));
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return await this.getDbInstance()
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await this.getDbInstance().select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await this.getDbInstance().insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await this.getDbInstance()
      .update(tasks)
      .set(taskData)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async updateTaskStatus(id: number, status: 'todo' | 'in-progress' | 'completed'): Promise<Task | undefined> {
    const [updatedTask] = await this.getDbInstance()
      .update(tasks)
      .set({ status })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    await this.getDbInstance().delete(tasks).where(eq(tasks.id, id));
    return true;
  }
}
