import { Router, Request, Response, NextFunction } from "express";

const router = Router();

// Dashboard stats endpoint
router.get('/dashboard/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Örnek veri
    res.json({ totalUsers: 10, totalProjects: 5 });
  } catch (error) {
    next(error);
  }
});

// Dashboard upcoming tasks endpoint
router.get('/dashboard/upcoming-tasks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json([{ id: 1, title: "Yaklaşan Görev 1" }]);
  } catch (error) {
    next(error);
  }
});

// Dashboard recent quotes endpoint
router.get('/dashboard/recent-quotes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json([{ id: 1, quote: "Son Teklif 1" }]);
  } catch (error) {
    next(error);
  }
});

// Dashboard activities endpoint
router.get('/dashboard/activities', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json([{ id: 1, activity: "Aktivite 1" }]);
  } catch (error) {
    next(error);
  }
});

// Dashboard active projects endpoint
router.get('/dashboard/active-projects', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json([{ id: 1, name: "Aktif Proje 1" }]);
  } catch (error) {
    next(error);
  }
});

export default router;