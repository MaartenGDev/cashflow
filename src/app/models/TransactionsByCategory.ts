import {Transaction} from "./Transaction";

export type TransactionsByCategory = Record<string, CategoryWithTransactions>;

export type CategoryWithTransactions = {name: string, totalAmountInCents: number; transactions: Transaction[]};
