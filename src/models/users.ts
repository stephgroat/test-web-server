/**
 * Users model actions
 **/
import { Sequelize, DataTypes, Transaction } from 'sequelize';
import { DebitCredit } from './_index';

export interface UserProperties {
  userId: string;
  name?: string;
  accountBalance: number;
}
export class UsersAccessor {
  private db: Sequelize;
  private Users: any;

  constructor(db: Sequelize) {
    this.db = db;
    this.Users = this.db.define('users', {
      userId: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(255), // not handling the case of multi-billion dollar balances
        allowNull: true
      },
      accountBalance: {
        type: DataTypes.INTEGER, // not handling the case of multi-billion dollar balances
        allowNull: false
      }
    });
    this.Users.sync();
  }

  getModel() {
    return this.Users;
  }

  async getUser(userId: string): Promise<UserProperties> {
    return this.Users.findOne({
      where: {
        userId: userId
      }
    });
  }
  async updateBalance(userId: string, amount: number): Promise<number> {
    return this.Users.update(
      {
        accountBalance: amount
      },
      {
        where: {
          userId: userId
        }
      }
    );
  }
}
