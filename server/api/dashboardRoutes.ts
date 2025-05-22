import { Router, Request, Response, NextFunction } from "express";
const router = Router();

router.get('/dashboard/stats', async (req: Request, res: Response, next: NextFunction) => {
  res.json({ totalUsers: 10, totalProjects: 5 });
});
router.get('/dashboard/upcoming-tasks', async (req: Request, res: Response, next: NextFunction) => {
  res.json([{ id: 1, title: "Yaklaşan Görev 1" }]);
});
router.get('/dashboard/recent-quotes', async (req: Request, res: Response, next: NextFunction) => {
  res.json([{ id: 1, quote: "Son Teklif 1" }]);
});
router.get('/dashboard/activities', async (req: Request, res: Response, next: NextFunction) => {
  res.json([{ id: 1, activity: "Aktivite 1" }]);
});
router.get('/dashboard/active-projects', async (req: Request, res: Response, next: NextFunction) => {
  res.json([{ id: 1, name: "Aktif Proje 1" }]);
});

export default router;