import {
  users, User, InsertUser,
  accounts, Account, InsertAccount,
  transactions, Transaction, InsertTransaction,
  quotes, Quote, InsertQuote,
  quoteItems, QuoteItem, InsertQuoteItem,
  projects, Project, InsertProject,
  tasks, Task, InsertTask,
} from "@shared/schema";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  private getDbInstance() {
    return getDb();
  }

  // Kullanıcı işlemleri
  async getUsers(): Promise<User[]> {
    return await this.getDbInstance().select().from(users);
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await this.getDbInstance().select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const [created] = await this.getDbInstance().insert(users).values(user).returning();
    return created;
  }

  // Cari Hesap işlemleri
  async getAccounts(): Promise<Account[]> {
    return await this.getDbInstance().select().from(accounts);
  }

  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await this.getDbInstance().select().from(accounts).where(eq(accounts.id, id));
    return account;
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const [created] = await this.getDbInstance().insert(accounts).values(account).returning();
    return created;
  }

  async updateAccount(id: number, accountData: Partial<InsertAccount>): Promise<Account | undefined> {
    const [updated] = await this.getDbInstance()
      .update(accounts)
      .set(accountData)
      .where(eq(accounts.id, id))
      .returning();
    return updated;
  }

  async deleteAccount(id: number): Promise<boolean> {
    await this.getDbInstance().delete(accounts).where(eq(accounts.id, id));
    return true;
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

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [created] = await this.getDbInstance().insert(transactions).values(transaction).returning();
    return created;
  }

  // Teklif işlemleri
  async getQuote(id: number): Promise<Quote & { account?: Account } | undefined> {
    const db = this.getDbInstance();
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    if (!quote) return undefined;
    const [account] = await db.select().from(accounts).where(eq(accounts.id, quote.accountId));
    return { ...quote, account };
  }

  async getQuotesByAccount(accountId: number): Promise<Quote[]> {
    return await this.getDbInstance()
      .select()
      .from(quotes)
      .where(eq(quotes.accountId, accountId));
  }

  async getQuotes(): Promise<Quote[]> {
    return await this.getDbInstance().select().from(quotes);
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [created] = await this.getDbInstance().insert(quotes).values(quote).returning();
    return created;
  }

  async updateQuote(id: number, quoteData: Partial<InsertQuote>): Promise<Quote | undefined> {
    const [updated] = await this.getDbInstance()
      .update(quotes)
      .set(quoteData)
      .where(eq(quotes.id, id))
      .returning();
    return updated;
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

  async createQuoteItem(item: InsertQuoteItem): Promise<QuoteItem> {
    const [created] = await this.getDbInstance().insert(quoteItems).values(item).returning();
    return created;
  }

  async updateQuoteItem(id: number, itemData: Partial<InsertQuoteItem>): Promise<QuoteItem | undefined> {
    const [updated] = await this.getDbInstance()
      .update(quoteItems)
      .set(itemData)
      .where(eq(quoteItems.id, id))
      .returning();
    return updated;
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

  async createProject(project: InsertProject): Promise<Project> {
    const [created] = await this.getDbInstance().insert(projects).values(project).returning();
    return created;
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await this.getDbInstance()
      .update(projects)
      .set(projectData)
      .where(eq(projects.id, id))
      .returning();
    return updated;
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

  async createTask(task: InsertTask): Promise<Task> {
    const [created] = await this.getDbInstance().insert(tasks).values(task).returning();
    return created;
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const [updated] = await this.getDbInstance()
      .update(tasks)
      .set(taskData)
      .where(eq(tasks.id, id))
      .returning();
    return updated;
  }

  async updateTaskStatus(id: number, status: 'todo' | 'in-progress' | 'completed'): Promise<Task | undefined> {
    const [updated] = await this.getDbInstance()
      .update(tasks)
      .set({ status })
      .where(eq(tasks.id, id))
      .returning();
    return updated;
  }

  async deleteTask(id: number): Promise<boolean> {
    await this.getDbInstance().delete(tasks).where(eq(tasks.id, id));
    return true;
  }
}