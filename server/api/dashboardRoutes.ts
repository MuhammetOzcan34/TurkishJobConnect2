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

// Son aktiviteler
router.get("/activities", async (req: Request, res: Response) => {
  res.json({ activities: [] });
});

export default router;