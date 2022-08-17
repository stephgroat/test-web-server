import { Sequelize, DataTypes } from 'sequelize';

export class Database {
  private db: Sequelize;
  constructor(db?: Sequelize) {
    this.db = db || new Sequelize('sqlite::memory:', { logging: false });
  }
  connect() {
    return this.db
      .authenticate()
      .then(() => {
        console.log('Database Connection Established');
        return this.db;
      })
      .catch((err) => {
        throw new Error('DB Connection Error');
      });
  }
  close() {
    this.db
      .close()
      .then(() => {
        console.log('Database Connection Closed');
      })
      .catch((err) => {
        throw new Error('Couldnt close database connection');
      });
  }
  getDb() {
    return this.db;
  }
}
