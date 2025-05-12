import { pgTable, text, serial, integer, boolean, timestamp, numeric, foreignKey, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const accountTypeEnum = pgEnum('account_type', ['customer', 'vendor']);
export const quoteTypeEnum = pgEnum('quote_type', ['sent', 'received']);
export const quoteStatusEnum = pgEnum('quote_status', ['pending', 'approved', 'rejected', 'cancelled']);
export const projectStatusEnum = pgEnum('project_status', ['active', 'completed', 'cancelled', 'on_hold']);
export const taskStatusEnum = pgEnum('task_status', ['todo', 'in-progress', 'completed']);
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high']);
export const transactionTypeEnum = pgEnum('transaction_type', ['debit', 'credit']);
export const currencyEnum = pgEnum('currency', ['TRY', 'USD', 'EUR']);

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  position: text("position"),
  companyName: text("company_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Accounts table (Cari Hesaplar)
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: accountTypeEnum("type").notNull().default('customer'),
  branch: text("branch"),
  contact: text("contact"),
  contactTitle: text("contact_title"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  taxId: text("tax_id"),
  taxOffice: text("tax_office"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Transactions table (Cari Hareketler)
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => accounts.id),
  date: timestamp("date").defaultNow().notNull(),
  description: text("description").notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  projectId: integer("project_id").references(() => projects.id),
  quoteId: integer("quote_id").references(() => quotes.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Quotes table (Teklifler)
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  number: text("number").notNull().unique(),
  type: quoteTypeEnum("type").notNull().default('sent'),
  accountId: integer("account_id").notNull().references(() => accounts.id),
  subject: text("subject").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  validUntil: timestamp("valid_until"),
  status: quoteStatusEnum("status").notNull().default('pending'),
  contactPerson: text("contact_person"),
  paymentTerms: text("payment_terms"),
  notes: text("notes"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  currency: currencyEnum("currency").default('TRY'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Quote items table
export const quoteItems = pgTable("quote_items", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id").notNull().references(() => quotes.id),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 12, scale: 2 }).default('0'),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Projects table (Projeler)
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  number: text("number").notNull().unique(),
  name: text("name").notNull(),
  accountId: integer("account_id").notNull().references(() => accounts.id),
  quoteId: integer("quote_id").references(() => quotes.id),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  status: projectStatusEnum("status").notNull().default('active'),
  description: text("description"),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  currency: currencyEnum("currency").default('TRY'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tasks table (Yapılacaklar)
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default('todo'),
  priority: taskPriorityEnum("priority").notNull().default('medium'),
  dueDate: timestamp("due_date"),
  accountId: integer("account_id").references(() => accounts.id),
  projectId: integer("project_id").references(() => projects.id),
  assigneeId: integer("assignee_id").references(() => users.id),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQuoteSchema = createInsertSchema(quotes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQuoteItemSchema = createInsertSchema(quoteItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, updatedAt: true });

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type QuoteItem = typeof quoteItems.$inferSelect;
export type InsertQuoteItem = z.infer<typeof insertQuoteItemSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
