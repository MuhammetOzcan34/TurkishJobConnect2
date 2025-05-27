import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    res.status(200).json([
      { id: 1, client: 'ABC Corp', amount: 5000 },
      { id: 2, client: 'XYZ Ltd', amount: 7500 }
    ]);
  } catch (error) {
    console.error('Error in /api/dashboard/recent-quotes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
} 