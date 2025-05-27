import { Router } from 'express';

const router = Router();

router.post('/api/users', (req, res) => {
  const { username, email, password } = req.body;
  
  // Burada normalde veritabanına kayıt işlemi yapılır
  res.status(201).json({
    id: Math.floor(Math.random() * 1000),
    username,
    email,
    createdAt: new Date()
  });
});

router.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  
  // Burada normalde veritabanından kullanıcı bilgileri çekilir
  res.json({
    id: userId,
    username: 'testuser',
    email: 'test@example.com',
    createdAt: new Date()
  });
});

export default router; 