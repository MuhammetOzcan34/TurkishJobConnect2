import { Router } from 'express';

const router = Router();

router.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalUsers: 150,
    activeProjects: 25,
    completedTasks: 75,
    pendingTasks: 30
  });
});

router.get('/api/dashboard/activities', (req, res) => {
  res.json([
    { id: 1, type: 'project', action: 'created', date: new Date() },
    { id: 2, type: 'task', action: 'completed', date: new Date() }
  ]);
});

router.get('/api/dashboard/active-projects', (req, res) => {
  res.json([
    { id: 1, name: 'Website Redesign', progress: 75 },
    { id: 2, name: 'Mobile App Development', progress: 45 }
  ]);
});

router.get('/api/dashboard/upcoming-tasks', (req, res) => {
  res.json([
    { id: 1, title: 'Client Meeting', dueDate: new Date() },
    { id: 2, title: 'Project Review', dueDate: new Date() }
  ]);
});

router.get('/api/dashboard/recent-quotes', (req, res) => {
  res.json([
    { id: 1, client: 'ABC Corp', amount: 5000 },
    { id: 2, client: 'XYZ Ltd', amount: 7500 }
  ]);
});

export default router; 