import { Router, Request, Response } from "express";

const router = Router();

// Dashboard istatistikleri
router.get("/stats", async (req: Request, res: Response) => {
  res.json({ stats: {} });
});

// Aktif projeler
router.get("/active-projects", async (req: Request, res: Response) => {
  res.json({ projects: [] });
});

// Yaklaşan görevler
router.get("/upcoming-tasks", async (req: Request, res: Response) => {
  res.json({ tasks: [] });
});

// Son teklifler
router.get("/recent-quotes", async (req: Request, res: Response) => {
  res.json({ quotes: [] });
});
import { Router, Request, Response } from "express";

const router = Router();

// Dashboard stats endpoint
router.get("/dashboard/stats", async (req: Request, res: Response) => {
  res.json({ stats: { totalUsers: 10, totalProjects: 5 } }); // Örnek veri
});

// Aktif projeler
router.get("/dashboard/active-projects", async (req: Request, res: Response) => {
  res.json({ projects: [] }); // Örnek veri
});

// Yaklaşan görevler
router.get("/dashboard/upcoming-tasks", async (req: Request, res: Response) => {
  res.json({ tasks: [] }); // Örnek veri
});

// Son teklifler
router.get("/dashboard/recent-quotes", async (req: Request, res: Response) => {
  res.json({ quotes: [] }); // Örnek veri
});

// Son aktiviteler
router.get("/dashboard/activities", async (req: Request, res: Response) => {
  res.json({ activities: [] }); // Örnek veri
});

export default router;
// Son aktiviteler
router.get("/activities", async (req: Request, res: Response) => {
  res.json({ activities: [] });
});

export default router;