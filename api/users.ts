import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const { username, email, password } = req.body;
      
      // Burada normalde veritabanına kayıt işlemi yapılır
      res.status(201).json({
        id: Math.floor(Math.random() * 1000),
        username,
        email,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error in POST /api/users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'GET') {
    try {
      // Burada normalde veritabanından kullanıcı listesi çekilir
      res.status(200).json([
        { id: 1, username: 'user1', email: 'user1@example.com' },
        { id: 2, username: 'user2', email: 'user2@example.com' }
      ]);
    } catch (error) {
      console.error('Error in GET /api/users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 