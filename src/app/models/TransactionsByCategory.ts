import {ITransaction} from "./ITransaction";

export type TransactionsByCategory = Record<string, CategoryWithTransactions>;

export type CategoryWithTransactions = {name: string, totalAmountInCents: number; transactions: ITransaction[]};
