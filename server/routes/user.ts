import { Router } from 'express';

const router = Router();

router.post('/api/users', (req, res) => {
  res.json({ message: 'User created' });
});

router.get('/api/users/:id', (req, res) => {
  res.json({ message: 'User details' });
});

export default router; 