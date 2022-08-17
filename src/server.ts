import { Sequelize } from 'sequelize';
import { Express } from 'express';
import { Server } from 'http';
import { json, urlencoded } from 'body-parser';

import sequelizeFixtures from 'sequelize-fixtures';

import express from 'express';
import * as routes from './routes/_index';

export class AppServer {
  private app: Express;
  private db: Sequelize;

  constructor(
    db: Sequelize = new Sequelize('sqlite::memory:', { logging: false }),
    app: Express = express()
  ) {
    this.app = app;
    this.db = db;
  }

  configureRoutes() {
    this.app.use(urlencoded({ extended: true }));
    this.app.use(json());
    routes.initRoutes(this);
  }
  getApp() {
    return this.app;
  }
  getDb() {
    return this.db;
  }
  async initDbData(fixtureFile: string) {
    await sequelizeFixtures.loadFile(fixtureFile, this.db.models);
  }
  start(PORT: string | number) {
    return this.app.listen(PORT, () => {
      console.log(`⚡️[server]: Server running at http://localhost:${PORT}`);
    });
  }
}
