/*
  Transactions controllers
*/
import { Sequelize, Transaction } from 'sequelize';

import { Request, Response, NextFunction } from 'express';
import { GeneralError, BadRequest } from '../utils/error';
import { Amount, DebitCredit, UserProperties } from '../models/_index';
import { Models } from '../models/_index';

enum ResponseCode {
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED'
}

interface AuthorizationRequest {
  userId: string;
  messageId: string;
  transactionAmount: Amount;
}

interface AuthorizationResponse {
  userId: string;
  messageId: string;
  responseCode: ResponseCode;
  balance: Amount;
}

interface LoadRequest {
  userId: string;
  messageId: string;
  transactionAmount: Amount;
}

interface LoadResponse {
  userId: string;
  messageId: string;
  balance: Amount;
}

let models: Models; // needs to live as global to avoid callback issues with using `this`

export class TransactionController {
  constructor(db: Sequelize) {
    models = new Models(db);
  }

  async putAuthorization(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<AuthorizationResponse>> {
    try {
      const authReq: AuthorizationRequest = req.body;
      const user = await models.Users.getUser(authReq.userId);
      if (!user) {
        throw new BadRequest('Invalid userId');
      }

      let authorization = await models.Transactions.getTransaction(
        authReq.messageId
      );

      if (!authorization) {
        authorization = await processTransaction(
          user,
          authReq.messageId,
          authReq.transactionAmount
        );
      } else if (authorization.userId !== user.userId) {
        throw new BadRequest('Invalid messageId for userId');
      }

      const stringAmount: string = `${Math.floor(user.accountBalance / 100)}.${(
        user.accountBalance % 100
      ).toLocaleString('en-US', {
        minimumIntegerDigits: 2
      })}`;

      const responseData: AuthorizationResponse = {
        userId: authorization.userId,
        messageId: authorization.messageId,
        responseCode: authorization.responseCode,
        balance: {
          amount: stringAmount,
          currency: authorization.currency,
          debitOrCredit: authorization.debitOrCredit
        }
      };

      return res.status(201).send(responseData);
    } catch (err) {
      if (!(err instanceof GeneralError)) {
        console.log(err);
        err = new GeneralError(err);
      }
      return res
        .status(err.getCode())
        .send({ code: err.getCode(), message: err.message });
    }
  }

  async putDeposit(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<LoadResponse>> {
    try {
      const loadReq: LoadRequest = req.body;
      const user = await models.Users.getUser(loadReq.userId);
      if (!user) {
        throw new BadRequest('Invalid userId');
      }

      let authorization = await models.Transactions.getTransaction(
        loadReq.messageId
      );

      if (!authorization) {
        authorization = await processTransaction(
          user,
          loadReq.messageId,
          loadReq.transactionAmount
        );
      } else if (authorization.userId !== user.userId) {
        throw new BadRequest('Invalid messageId for userId');
      }

      const stringAmount: string = `${Math.floor(user.accountBalance / 100)}.${(
        user.accountBalance % 100
      ).toLocaleString('en-US', {
        minimumIntegerDigits: 2
      })}`;

      const responseData: LoadResponse = {
        userId: authorization.userId,
        messageId: authorization.messageId,
        balance: {
          amount: stringAmount,
          currency: authorization.currency,
          debitOrCredit: authorization.debitOrCredit
        }
      };

      return res.status(201).send(responseData);
    } catch (err) {
      if (!(err instanceof GeneralError)) {
        console.log(err);
        err = new GeneralError(err);
      }
      return res
        .status(err.getCode())
        .send({ code: err.getCode(), message: err.message });
    }
  }
}

async function processTransaction(
  user: UserProperties,
  messageId: string,
  amount: Amount
) {
  const dollarsAndCents = amount.amount.split('.');
  let dollarAmount = parseInt(dollarsAndCents[0]) * 100;
  if (dollarsAndCents.length > 1 && dollarAmount >= 0) {
    if (dollarsAndCents[1].length === 1) {
      dollarsAndCents[1] = dollarsAndCents[1].concat('0');
    }
    dollarAmount += parseInt(dollarsAndCents[1]);
  }
  if (isNaN(dollarAmount)) {
    throw new BadRequest('Invalid amount');
  }

  dollarAmount = Math.max(0, dollarAmount);
  let resCode = ResponseCode.APPROVED;
  if (amount.debitOrCredit === DebitCredit.CREDIT) {
    user.accountBalance += dollarAmount;
  } else if (
    amount.debitOrCredit === DebitCredit.DEBIT &&
    user.accountBalance - dollarAmount >= 0
  ) {
    user.accountBalance = user.accountBalance - dollarAmount;
  } else {
    if (amount.debitOrCredit !== DebitCredit.DEBIT) {
      throw new BadRequest('Invalid transaction type');
    }
    resCode = ResponseCode.DECLINED;
  }

  if (resCode === ResponseCode.APPROVED) {
    await models.Users.updateBalance(user.userId, user.accountBalance);
  }
  let transaction = {
    messageId: messageId,
    userId: user.userId,
    amount: dollarAmount,
    currency: amount.currency,
    debitOrCredit: amount.debitOrCredit,
    responseCode: resCode
  };

  return await models.Transactions.createTransaction(transaction);
}
