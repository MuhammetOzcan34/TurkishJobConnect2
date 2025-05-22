export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  position: string | null;
  username: string;
  phone: string | null;
  companyName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: number;
  name: string;
  address: string | null;
  type: "customer" | "vendor";
  email: string | null;
  phone: string | null;
  taxId: string | null;
  taxOffice: string | null;
  iban: string | null;
  contactName: string | null;
  contactEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  number: string;
  id: number;
  name: string;
  status: "active" | "completed" | "cancelled" | "on_hold";
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
  accountId: number;
  startDate: Date | null;
  endDate: Date | null;
  budget: string | null;
  currency: "TRY" | "USD" | "EUR" | null;
}

export interface Task {
  id: number;
  title: string;
  status: "todo" | "in-progress" | "completed";
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
  priority: "high" | "medium" | "low";
  dueDate: Date | null;
  projectId: number | null;
  assignedToId: number | null;
  createdById: number | null;
  accountId?: number | null;
}

export interface Quote {
  number: string;
  id: number;
  type: "received" | "sent";
  date: Date;
  status: "cancelled" | "approved" | "pending" | "rejected";
  createdAt: Date;
  updatedAt: Date;
  accountId: number;
  subject: string;
  totalAmount: string;
  paymentTerms?: string | null;
  validUntil?: Date | null;
  contactPerson?: string | null;
  notes?: string | null;
  currency?: string | null;
  items?: QuoteItem[];
}

export interface QuoteItem {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  description: string;
  quoteId: number;
  quantity: string;
  unit: string;
  unitPrice: string;
  discount: string | null;
  taxRate: string | null;
  lineTotal: string;
}

export interface Transaction {
  id: number;
  type: "debit" | "credit";
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  description: string;
  accountId: number;
  projectId: number | null;
  notes: string | null;
  amount: string;
  quoteId: number | null;
}

export interface IStorage {
  createUser(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  private users: User[] = [];
  private userId = 1;

  async createUser(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const now = new Date();
    const newUser: User = {
      ...user,
      id: this.userId++,
      createdAt: now,
      updatedAt: now,
      position: user.position ?? null,
      phone: user.phone ?? null,
      companyName: user.companyName ?? null,
    };
    this.users.push(newUser);
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    return this.users;
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }
}

export const storage = new MemStorage();