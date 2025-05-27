import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';

const allowedOrigins = [
  'https://turkish-job-connect2-muhammetozcan34s-projects.vercel.app',
  'https://turkish-job-connect2-hpvtn438l-muhammetozcan34s-projects.vercel.app',
  'http://localhost:3000'
];

const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
});

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void> | void;

export function withCors(handler: Handler): Handler {
  return (req: VercelRequest, res: VercelResponse) => {
    return new Promise<void>((resolve, reject) => {
      corsMiddleware(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result);
        }
        
        // Set CORS headers for OPTIONS requests
        if (req.method === 'OPTIONS') {
          res.status(200).end();
          return resolve();
        }
        
        try {
          const handlerResult = handler(req, res);
          if (handlerResult && typeof handlerResult.then === 'function') {
            handlerResult.then(resolve).catch(reject);
          } else {
            resolve();
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  };
} 