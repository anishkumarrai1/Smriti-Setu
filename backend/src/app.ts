import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// CORS configuration - dynamic origin to support local dev, public tunnels & custom domains
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Platform-Region'],
    credentials: true,
  })
);

app.use(express.json());

// Request logging in development
app.use((req: Request, res: Response, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// API Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'Smriti-Setu AI Gaming & Healthcare API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    region: 'Northeast India Ecosystem (NER)',
    supportedStates: [
      'Assam',
      'Arunachal Pradesh',
      'Manipur',
      'Meghalaya',
      'Mizoram',
      'Nagaland',
      'Sikkim',
      'Tripura',
    ],
  });
});

// Mount all modular domain APIs
app.use('/api', apiRouter);

// Serve static uploads (puzzles, voice samples, recordings)
const uploadsDir = path.resolve(__dirname, '../../uploads');
if (fs.existsSync(uploadsDir)) {
  app.use('/uploads', express.static(uploadsDir));
}

// Serve frontend production build (Single Link Full-Stack hosting)
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.use('/smriti-setu', express.static(frontendDist));

  // SPA Catch-all: Route all other GET requests to frontend index.html
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    const indexPath = path.join(frontendDist, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });
}

// Centralized error handler
app.use(errorHandler);

export default app;
