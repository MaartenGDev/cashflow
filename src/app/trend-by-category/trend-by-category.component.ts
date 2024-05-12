import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Transaction} from "../models/Transaction";
import {TransactionCategory, TransactionDescriptionToCategoryMap} from "../models/TransactionDescriptionToCategoryMap";
import {CategoryWithTransactions, TransactionsByCategory} from "../models/TransactionsByCategory";
import {ISpendingTable} from "../models/spending-table/SpendingTable";

@Component({
  selector: 'app-trend-by-category',
  templateUrl: './trend-by-category.component.html',
  styleUrls: ['./trend-by-category.component.scss']
})
export class TrendByCategoryComponent implements OnChanges {
  public spendingSummaryByCategory: {totalInCents: number; byCategory: CategoryWithTransactions[], totalTransactionCount: number} = {totalInCents: 0, byCategory: [], totalTransactionCount: 0};
  public transactionsWithUnknownCategory: Transaction[] = [];

  public spendingTable: ISpendingTable = {headerNames: [], rows: []};

  @Input()
  public transactions: Transaction[] = [];

  @Input()
  public showIncomeInsteadOfExpenses = false;

  private getMonthNamesFromTransactions(transactions: Transaction[]){
    return [...new Set(transactions.map(t => t.monthName))];
  }

  private setDatasets(transactions: Transaction[]) {
    const spendingByCategoryAndPeriod: Partial<Record<TransactionCategory, { [periodName: string]: Transaction[] }>> = {};

    const transactionsForDataset = transactions.filter(t => this.showIncomeInsteadOfExpenses && t.amountOfCents > 0 || !this.showIncomeInsteadOfExpenses && t.amountOfCents < 0);

    const monthNames = this.getMonthNamesFromTransactions(transactionsForDataset);
    const categories = new Set(transactionsForDataset.map(t => this.getCategory(t)));

    for (const categoryName of categories) {
      spendingByCategoryAndPeriod[categoryName] = {};

      monthNames.forEach(monthName => {
        spendingByCategoryAndPeriod[categoryName]![monthName] = [];
      })
    }

    for (const transaction of transactionsForDataset) {
      const transactionCategory = this.getCategory(transaction);

      spendingByCategoryAndPeriod[transactionCategory]![transaction.monthName].push(transaction);
    }

    const getTransactionCategories = this.getTransactionCategoriesWithTotals(transactionsForDataset);

    this.spendingSummaryByCategory = {
      totalInCents: getTransactionCategories.reduce((acc, cur) => acc + Math.abs(cur.totalAmountInCents), 0),
      byCategory: getTransactionCategories,
      totalTransactionCount: transactionsForDataset.length
    };

    this.transactionsWithUnknownCategory = getTransactionCategories.find(c => c.name === TransactionCategory.Other)?.transactions || [];

    this.spendingTable.headerNames = ['Category', ...this.getMonthNamesFromTransactions(transactionsForDataset), 'Total'];
    this.spendingTable.rows =  Object.keys(spendingByCategoryAndPeriod).map((categoryName, index) => {
      const transactionsByMonth = Object.values(spendingByCategoryAndPeriod[categoryName as TransactionCategory]!)
        .map(transactionsInMonth => ({
          transactions: transactionsInMonth,
          totalInCents: transactionsInMonth.reduce((acc, cur) => acc + cur.amountOfCents, 0)
        }));

      return {
        rowTitle: categoryName,
        isExpanded: false,
        cells: [
          ...transactionsByMonth,
          {transactions: [], totalInCents: transactionsByMonth.reduce((acc, cur) => acc + cur.totalInCents, 0)}
        ]
      }
    });

    this.spendingTable.rows.sort((a, b) =>
      b.cells.reduce((acc, cur) => acc + Math.abs(cur.totalInCents), 0)
      -
      a.cells.reduce((acc, cur) => acc + Math.abs(cur.totalInCents), 0)
    )
  }

  private getTransactionCategoriesWithTotals(transactions: Transaction[]): CategoryWithTransactions[] {
    const transactionCategories = Object.values(transactions.reduce((acc, cur) => {
      const transactionCategory = this.getCategory(cur);

      return {...acc, [transactionCategory]: {
          name: transactionCategory,
          totalAmountInCents: (acc[transactionCategory]?.totalAmountInCents || 0) + cur.amountOfCents,
          transactions: [...(acc[transactionCategory]?.transactions || []), cur]
        }
      }
    }, {} as TransactionsByCategory));

    transactionCategories.sort((a, b) => a.totalAmountInCents - b.totalAmountInCents)

    return transactionCategories;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['transactions']){
      this.setDatasets(this.transactions)
    }
  }

  private getCategory(transaction: Transaction): TransactionCategory {
    return TransactionDescriptionToCategoryMap[transaction.targetAccountName] || TransactionCategory.Other;
  }
}
