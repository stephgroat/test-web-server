/*
  Contains the routes for client transactions
*/
import { Sequelize } from 'sequelize';
import { Express, Request, Response } from 'express';
import { TransactionController } from '../controllers/_index';

export function routes(app: Express, db: Sequelize) {
  const controller = new TransactionController(db);
  app.put('/authorization/:messageId', controller.putAuthorization);
  app.put('/load/:messageId', controller.putDeposit);
}
