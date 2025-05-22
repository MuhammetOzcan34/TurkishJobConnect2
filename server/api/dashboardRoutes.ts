import { Router, Request, Response, NextFunction } from "express";
const router = Router();

router.get('/dashboard/stats', (req: Request, res: Response) => {
  res.json({ totalUsers: 10, totalProjects: 5 });
});
router.get('/dashboard/upcoming-tasks', (req: Request, res: Response) => {
  res.json([{ id: 1, title: "Yaklaşan Görev 1" }]);
});
router.get('/dashboard/recent-quotes', (req: Request, res: Response) => {
  res.json([{ id: 1, quote: "Son Teklif 1" }]);
});
router.get('/dashboard/activities', (req: Request, res: Response) => {
  res.json([{ id: 1, activity: "Aktivite 1" }]);
});
router.get('/dashboard/active-projects', (req: Request, res: Response) => {
  res.json([{ id: 1, name: "Aktif Proje 1" }]);
});

export default router;