import { Router } from 'express';

const router = Router();

router.post('/users', (req, res) => {
  res.json({ message: 'User created' });
});

router.get('/users/:id', (req, res) => {
  res.json({ message: 'User details' });
});

export default router; 