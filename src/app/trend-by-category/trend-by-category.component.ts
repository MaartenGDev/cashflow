import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ITransaction} from "../models/ITransaction";
import { TransactionDescriptionMappingConstants } from "../models/TransactionDescriptionToCategoryMap";
import {CategoryWithTransactions, TransactionsByCategory} from "../models/TransactionsByCategory";
import {ISpendingTable, ISpendingTableColumn, ISpendingTableRow} from "../models/spending-table/SpendingTable";
import {ChartConfiguration, Color, Plugin, TooltipItem} from "chart.js";
import ChartDataLabels, {Context} from 'chartjs-plugin-datalabels';
import {AmountAsEurosPipe} from "../pipes/currency-pipe";
import {CurrencyPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {BaseChartDirective} from "ng2-charts";
import {IDecoratedTransaction} from "../models/IDecoratedTransaction";
import {ISalaryPeriod} from "../models/ISalaryPeriod";


@Component({
  selector: 'app-trend-by-category',
  templateUrl: './trend-by-category.component.html',
  styleUrls: ['./trend-by-category.component.scss'],
  imports: [
    AmountAsEurosPipe,
    CurrencyPipe,
    BaseChartDirective,
    NgClass,
    NgForOf,
    NgIf
  ],
  standalone: true
})
export class TrendByCategoryComponent implements OnChanges {
  public spendingSummaryByCategory: {totalInCents: number; byCategory: CategoryWithTransactions[], totalTransactionCount: number} = {totalInCents: 0, byCategory: [], totalTransactionCount: 0};
  public transactionsWithUnknownCategory: ITransaction[] = [];

  public spendingTable: ISpendingTable = {columns: [], rows: []};

  @Input()
  public transactions: IDecoratedTransaction[] = [];

  @Input()
  public showIncomeInsteadOfExpenses = false;

  @Input()
  transactionDescriptionToCategoryMap: Record<string, string> = {};

  public currentRowToShowChartFor?: ISpendingTableRow = undefined;

  private noFractionsFormatter: Intl.NumberFormat = new Intl.NumberFormat("nl-NL");
  private twoFractionsFormatter: Intl.NumberFormat = new Intl.NumberFormat("nl-NL", {minimumFractionDigits: 2});

  public lineChartData: ChartConfiguration['data'] = {
    datasets: []
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    scales: {
      y: {
        ticks: {
          callback: (value, index, ticks)=> {
            return '€ ' + this.noFractionsFormatter.format(value as number);
          }
        }
      }
    },
    layout: {
      padding: {
        top: 0,
        right: 32,
        bottom: 16,
        left: 0
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<"line">): string | string[] | void => {
            return ' Total: € ' + this.twoFractionsFormatter.format(tooltipItem.dataset.data[tooltipItem.dataIndex] as number);
          },
          footer: this.buildTooltip.bind(this),
          title: (tooltipItems: TooltipItem<"line">[]): string | string[] | void => {
            const period = this.transactions.find(t => t.salaryMonthName === tooltipItems[0].label)!.period;

            return `${tooltipItems[0].label} (${this.dateFormatter.format(period.startDate)} t/m ${this.dateFormatter.format(period.endDate)})`;
          }
        }
      },
      datalabels: {
        backgroundColor: (context: Context) => context.dataset.backgroundColor as Color,
        borderRadius: 4,
        color: 'white',
        font: {
          weight: 'bold'
        },
        formatter: (value: number, context: Context) => {
          const formatter = value % 1 === 0
              ? this.noFractionsFormatter
              : this.twoFractionsFormatter;

          return '€ ' + formatter.format(value)
        },
        padding: 6
      }
    },
  };

  public chartPlugins: Plugin[] = [
    ChartDataLabels
  ];

  private dateFormatter = new Intl.DateTimeFormat('nl-NL', {hour12: false, day: "2-digit", month: "2-digit", year: "numeric"});

  private getMonthColumnsFromTransactions(transactions: IDecoratedTransaction[]): ISpendingTableColumn[] {
    return [...new Set(transactions.map(t => t.salaryMonthName))]
        .map(monthName => ({label: monthName, isSummaryColumn: false}));
  }

  private setDatasets(transactions: IDecoratedTransaction[]) {
    const spendingByCategoryAndPeriod: Partial<Record<string, { [periodName: string]: ITransaction[] }>> = {};

    const transactionsForDataset = transactions
      .filter(t => this.showIncomeInsteadOfExpenses && t.amountOfCents > 0 || !this.showIncomeInsteadOfExpenses && t.amountOfCents < 0)
      .filter(t => t.category !== 'InternalMoneyTransfer');

    const monthColumns = this.getMonthColumnsFromTransactions(transactionsForDataset);
    const categories = new Set(transactionsForDataset.map(t => t.category));

    for (const categoryName of categories) {
      spendingByCategoryAndPeriod[categoryName] = {};

      monthColumns.forEach(monthColumn => {
        spendingByCategoryAndPeriod[categoryName]![monthColumn.label] = [];
      })
    }

    for (const transaction of transactionsForDataset) {
      spendingByCategoryAndPeriod[transaction.category]![transaction.salaryMonthName].push(transaction);
    }

    const getTransactionCategories = this.getTransactionCategoriesWithTotals(transactionsForDataset);

    this.spendingSummaryByCategory = {
      totalInCents: getTransactionCategories.reduce((acc, cur) => acc + Math.abs(cur.totalAmountInCents), 0),
      byCategory: getTransactionCategories,
      totalTransactionCount: transactionsForDataset.length
    };

    this.transactionsWithUnknownCategory = getTransactionCategories.find(c => c.name === TransactionDescriptionMappingConstants.UnknownCategory)?.transactions || [];

    this.spendingTable.columns = [{label: 'Category', isSummaryColumn: true}, {label: 'Average', isSummaryColumn: true}, {label: 'Total', isSummaryColumn: true}, ...this.getMonthColumnsFromTransactions(transactionsForDataset)];
    this.spendingTable.rows =  Object.keys(spendingByCategoryAndPeriod).map((categoryName) => {
      const transactionsByMonth = Object.values(spendingByCategoryAndPeriod[categoryName]!)
        .map(transactionsInMonth => ({
          isSummaryCell: false,
          transactions: transactionsInMonth,
          totalInCents: transactionsInMonth.reduce((acc, cur) => acc + cur.amountOfCents, 0)
        }));

      const totalCentsForMonth = transactionsByMonth.reduce((acc, cur) => acc + cur.totalInCents, 0);
      const averageCentsForMonths = transactionsByMonth.reduce((acc, cur) => acc + cur.totalInCents, 0)/transactionsByMonth.length;

      return {
        rowTitle: categoryName,
        isExpanded: false,
        cells: [
          {transactions: [], isSummaryCell: true, totalInCents: averageCentsForMonths},
          {transactions: [], isSummaryCell: true, totalInCents: totalCentsForMonth},
          ...transactionsByMonth
        ],
        totalInCents: totalCentsForMonth,
        averageInCents: averageCentsForMonths
      }
    });

    this.spendingTable.rows.push({
      totalInCents: transactionsForDataset.reduce((acc, cur) => acc+ cur.amountOfCents, 0),
      averageInCents: transactionsForDataset.reduce((acc, cur) => acc+ cur.amountOfCents, 0) / monthColumns.length,
      rowTitle: 'Totals',
      cells: [
        {isSummaryCell: true,totalInCents: transactionsForDataset.reduce((acc, cur) => acc+ cur.amountOfCents, 0) / monthColumns.length, transactions: []},
        {isSummaryCell: true,totalInCents: transactionsForDataset.reduce((acc, cur) => acc+ cur.amountOfCents, 0), transactions: []},
        ...monthColumns.map((monthColumn, columnIndex) => ({
          transactions: [],
          totalInCents: transactionsForDataset.filter(t => t.salaryMonthName === monthColumn.label).reduce((acc, cur) => acc + cur.amountOfCents, 0),
          isSummaryCell: false
        }))
      ],
      isExpanded: false
    })

    this.spendingTable.rows.sort((a, b) =>
      b.cells.reduce((acc, cur) => acc + Math.abs(cur.totalInCents), 0)
      -
      a.cells.reduce((acc, cur) => acc + Math.abs(cur.totalInCents), 0)
    )
  }

  private getTransactionCategoriesWithTotals(transactions: IDecoratedTransaction[]): CategoryWithTransactions[] {
    const transactionCategories = Object.values(transactions.reduce((acc, cur) => {

      return {...acc, [cur.category]: {
          name: cur.category,
          totalAmountInCents: (acc[cur.category]?.totalAmountInCents || 0) + cur.amountOfCents,
          transactions: [...(acc[cur.category]?.transactions || []), cur]
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

  showChartForRow(event: Event, table: ISpendingTable, row: ISpendingTableRow) {
    event.stopPropagation();
    this.currentRowToShowChartFor = row;

    this.lineChartData = {
      datasets: [
        {
          data: row.cells
              .filter(c => !c.isSummaryCell)
              .map(c => Math.abs(c.totalInCents / 100)),
          label: row.rowTitle,
          datalabels: {
            align: 'end',
            anchor: 'end'
          }
        }
      ],
      labels: table.columns.filter(c => !c.isSummaryColumn).map(c => c.label)
    };
  }

  private buildTooltip(tooltipItems: TooltipItem<"line">[]) {
    const firstTooltip = tooltipItems[0];
    const transactionsForCurrentPoint = this.currentRowToShowChartFor!.cells.filter(c => !c.isSummaryCell)[firstTooltip.dataIndex].transactions;

    return transactionsForCurrentPoint
        .map(t => ` ${this.dateFormatter.format(t.date)} - € ${this.twoFractionsFormatter.format(Math.abs(t.amountOfCents / 100))} ${t.targetAccountName}`)
  }
}
