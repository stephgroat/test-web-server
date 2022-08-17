/*
  Ping health check controller
*/
import { Request, Response, NextFunction } from 'express';
import { GeneralError } from '../utils/error';

interface Ping {
  serverTime: string;
}

export async function pingServer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<Ping>> {
  const timestamp = new Date().toISOString();
  return res.status(200).send({
    serverTime: timestamp
  });
}
