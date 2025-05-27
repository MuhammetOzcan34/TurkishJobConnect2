import { Router } from 'express';

const router = Router();

router.get('/dashboard/stats', (req, res) => {
  res.json({ message: 'Stats endpoint' });
});

router.get('/dashboard/activities', (req, res) => {
  res.json({ message: 'Activities endpoint' });
});

router.get('/dashboard/active-projects', (req, res) => {
  res.json({ message: 'Active projects endpoint' });
});

router.get('/dashboard/upcoming-tasks', (req, res) => {
  res.json({ message: 'Upcoming tasks endpoint' });
});

router.get('/dashboard/recent-quotes', (req, res) => {
  res.json({ message: 'Recent quotes endpoint' });
});

export default router; 