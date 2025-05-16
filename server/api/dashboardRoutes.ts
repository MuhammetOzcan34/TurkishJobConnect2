import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import dashboardRoutes from './api/dashboardRoutes';
import userRoutes from './api/userRoutes';

export function registerRoutes(app: Express): Server {
  // API rotalarını kaydet
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/users', userRoutes);
  
  // Diğer rotalar...
  
  // HTTP sunucusunu oluştur
  const server = createServer(app);
  return server;
}import { Router, Request, Response } from 'express';
import { storage } from '../storage';

const router = Router();

// Dashboard stats endpoint
router.get('/dashboard/stats', async (req: Request, res: Response) => {
  try {
    // Temel istatistikleri getir
    const accounts = await storage.getAccounts();
    const projects = await storage.getProjects();
    const quotes = await storage.getQuotes();
    const tasks = await storage.getTasks();
    
    const stats = {
      totalAccounts: accounts.length,
      totalProjects: projects.length,
      totalQuotes: quotes.length,
      totalTasks: tasks.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      pendingQuotes: quotes.filter(q => q.status === 'pending').length,
      todoTasks: tasks.filter(t => t.status === 'todo').length
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'İstatistikler alınırken bir hata oluştu' });
  }
});

// Recent activities endpoint
router.get('/dashboard/activities', async (req: Request, res: Response) => {
  try {
    // Son aktiviteleri getir (son eklenen işlemler, projeler, teklifler)
    const recentTransactions = await storage.getTransactions();
    const recentProjects = await storage.getProjects();
    const recentQuotes = await storage.getQuotes();
    
    // Son 10 aktiviteyi birleştir ve tarihe göre sırala
    const activities = [
      ...recentTransactions.map(t => ({ 
        type: 'transaction', 
        date: t.createdAt, 
        data: t 
      })),
      ...recentProjects.map(p => ({ 
        type: 'project', 
        date: p.createdAt, 
        data: p 
      })),
      ...recentQuotes.map(q => ({ 
        type: 'quote', 
        date: q.createdAt, 
        data: q 
      }))
    ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
    
    res.json(activities);
  } catch (error) {
    console.error('Dashboard activities error:', error);
    res.status(500).json({ error: 'Aktiviteler alınırken bir hata oluştu' });
  }
});

// Upcoming tasks endpoint
router.get('/dashboard/upcoming-tasks', async (req: Request, res: Response) => {
  try {
    const tasks = await storage.getTasks();
    
    // Tamamlanmamış ve yaklaşan görevleri getir
    const upcomingTasks = tasks
      .filter(task => task.status !== 'completed')
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, 5);
    
    res.json(upcomingTasks);
  } catch (error) {
    console.error('Upcoming tasks error:', error);
    res.status(500).json({ error: 'Yaklaşan görevler alınırken bir hata oluştu' });
  }
});

// Recent quotes endpoint
router.get('/dashboard/recent-quotes', async (req: Request, res: Response) => {
  try {
    const quotes = await storage.getQuotes();
    
    // Son 5 teklifi getir
    const recentQuotes = quotes
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    res.json(recentQuotes);
  } catch (error) {
    console.error('Recent quotes error:', error);
    res.status(500).json({ error: 'Son teklifler alınırken bir hata oluştu' });
  }
});

// Active projects endpoint
router.get('/dashboard/active-projects', async (req: Request, res: Response) => {
  try {
    const projects = await storage.getProjects();
    
    // Aktif projeleri getir
    const activeProjects = projects
      .filter(project => project.status === 'active')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    res.json(activeProjects);
  } catch (error) {
    console.error('Active projects error:', error);
    res.status(500).json({ error: 'Aktif projeler alınırken bir hata oluştu' });
  }
});

export default router;
