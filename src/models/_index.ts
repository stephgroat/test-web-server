import { Sequelize } from 'sequelize';
import { Database } from './database';
import {
  Amount,
  DebitCredit,
  Transaction,
  TransactionsAccessor
} from './transactions';
import { UsersAccessor, UserProperties } from './users';

export { Amount, DebitCredit, Transaction, UserProperties };

export class Models {
  private db: Sequelize;
  public Transactions: TransactionsAccessor;
  public Users: UsersAccessor;

  constructor(db: Sequelize) {
    this.db = db;
    this.Transactions = new TransactionsAccessor(db);
    this.Users = new UsersAccessor(db);
  }
}
