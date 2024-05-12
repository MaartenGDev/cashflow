import {TransactionCategory} from "./TransactionDescriptionToCategoryMap";
import {Transaction} from "./Transaction";

export type TransactionsByCategory = Record<TransactionCategory, CategoryWithTransactions>;

export type CategoryWithTransactions = {name: string, totalAmountInCents: number; transactions: Transaction[]};
