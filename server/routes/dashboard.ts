import { Router } from 'express';

const router = Router();

router.get('/api/dashboard/stats', (req, res) => {
  res.json({ message: 'Stats endpoint' });
});

router.get('/api/dashboard/activities', (req, res) => {
  res.json({ message: 'Activities endpoint' });
});

router.get('/api/dashboard/active-projects', (req, res) => {
  res.json({ message: 'Active projects endpoint' });
});

router.get('/api/dashboard/upcoming-tasks', (req, res) => {
  res.json({ message: 'Upcoming tasks endpoint' });
});

router.get('/api/dashboard/recent-quotes', (req, res) => {
  res.json({ message: 'Recent quotes endpoint' });
});

export default router; 