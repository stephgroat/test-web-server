/*
  Transactions model definitions
*/
import { Sequelize, DataTypes } from 'sequelize';

export enum DebitCredit {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT'
}
enum ResponseCode {
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED'
}

export interface Amount {
  amount: string;
  currency: string;
  debitOrCredit: DebitCredit;
}

export interface Transaction {
  messageId: string;
  userId: string;
  transactionAmount: Amount;
}

interface TransactionProperties {
  messageId: string;
  userId: string;
  amount: number;
  currency: string;
  debitOrCredit: DebitCredit;
  responseCode: ResponseCode;
}

export class TransactionsAccessor {
  private db: Sequelize;
  private Transactions: any;

  constructor(db: Sequelize) {
    this.db = db;
    this.Transactions = this.db.define('transactions', {
      messageId: {
        type: DataTypes.STRING(255), // if uuid4 is enforced, can make this length 36 for space saving
        primaryKey: true
      },
      userId: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      debitOrCredit: {
        type: DataTypes.ENUM,
        values: Object.keys(DebitCredit),
        allowNull: false
      },
      responseCode: {
        type: DataTypes.ENUM,
        values: Object.keys(ResponseCode),
        allowNull: false
      }
    });
    this.Transactions.sync();
  }
  getModel() {
    return this.Transactions;
  }

  async getTransaction(messageId: string): Promise<TransactionProperties> {
    return this.Transactions.findOne({
      where: {
        messageId: messageId
      }
    });
  }

  async createTransaction(
    transaction: TransactionProperties
  ): Promise<TransactionProperties> {
    return this.Transactions.create({
      ...transaction
    });
  }
}
