import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    res.status(200).json({
      totalUsers: 150,
      activeProjects: 25,
      completedTasks: 75,
      pendingTasks: 30
    });
  } catch (error) {
    console.error('Error in /api/dashboard/stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
} 