/*
  Health checking endpoint(s)
*/
import { Sequelize } from 'sequelize';
import { Express, Request, Response } from 'express';
import { PingController } from '../controllers/_index';

export function routes(app: Express, db?: Sequelize) {
  app.get('/ping', PingController.pingServer);
}
