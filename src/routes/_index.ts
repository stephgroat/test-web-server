import { Express, Request, Response } from 'express';
import { AppServer } from '../server';
import * as PingRoutes from './ping';
import * as TransactionRoutes from './transactions';
import { NotFound } from '../utils/error';

function routeNotFound(req: Request, res: Response) {
  const notFoundError = new NotFound('Route not found');
  return res.status(notFoundError.getCode()).send(notFoundError);
}

export function initRoutes(server: AppServer) {
  const app = server.getApp();
  const db = server.getDb();
  PingRoutes.routes(app);
  TransactionRoutes.routes(app, db);
  app.all('*', routeNotFound);
}
