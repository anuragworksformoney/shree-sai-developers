import app from '../src/server/app';

/**
 * Vercel Serverless Function entry point.
 * Directs all /api/* HTTP requests to the modular Express application.
 */
export default function handler(req: any, res: any) {
  return app(req, res);
}
