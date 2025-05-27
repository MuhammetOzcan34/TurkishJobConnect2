import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from '../_middleware';

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    res.status(200).json([
      { id: 1, name: 'Website Redesign', progress: 75 },
      { id: 2, name: 'Mobile App Development', progress: 45 }
    ]);
  } catch (error) {
    console.error('Error in /api/dashboard/active-projects:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default withCors(handler); 