import {Injectable} from "@angular/core";
import {ITransaction} from "../models/ITransaction";
import {IDecoratedTransaction} from "../models/IDecoratedTransaction";
import {ISalaryPeriod} from "../models/ISalaryPeriod";
import {TransactionDescriptionMappingConstants} from "../models/TransactionDescriptionToCategoryMap";

@Injectable({
  providedIn: 'root'
})
export class TransactionDecoratorService {
  monthFormatter = new Intl.DateTimeFormat('en-US', {month: "long", year: "numeric"});
  dayFormatter = new Intl.DateTimeFormat('en-US', {day: "numeric", month: "short"});

  public decorate(transactions: ITransaction[], transactionDescriptionToCategoryMap: Record<string, string>): IDecoratedTransaction[] {
    const salaryPeriods = this.getSalaryPeriods(transactions, transactionDescriptionToCategoryMap);

    return transactions.map(t => {
      const period = salaryPeriods.find(s => t.date >= s.startDate && t.date <= s.endDate)!;

      return {
        ...t,
        monthName: this.monthFormatter.format(t.date),
        category: this.getCategory(transactionDescriptionToCategoryMap, t),
        salaryMonthName: period.label,
        period: period
      };
    })
  }

  private getSalaryPeriods(transactions: ITransaction[], transactionDescriptionToCategoryMap: Record<string, string>): ISalaryPeriod[] {
    if (transactions.length === 0) {
      return [];
    }

    let salaryPeriods: ISalaryPeriod[] = [];
    let previousSalaryPeriodStartDate: null | Date = null;

    for (const transaction of transactions) {
      if (transaction.amountOfCents > 200_000 && this.getCategory(transactionDescriptionToCategoryMap, transaction) === "Salary") {
        if (previousSalaryPeriodStartDate) {
          salaryPeriods.push({
            startDate: previousSalaryPeriodStartDate,
            endDate: this.getDayBeforeAtMidnight(transaction.date),
            label: this.dayFormatter.format(previousSalaryPeriodStartDate) + ' - ' + this.dayFormatter.format(this.getDayBeforeAtMidnight(transaction.date))
          });
        }

        previousSalaryPeriodStartDate = transaction.date;
      }
    }

    if (salaryPeriods.length === 0) {
      const periodStartDate = transactions[0].date;
      const periodEndDate = transactions[transactions.length - 1].date;

      return [
        {
          startDate: periodStartDate,
          endDate: periodEndDate,
          label: this.dayFormatter.format(periodStartDate) + ' - ' + this.dayFormatter.format(periodEndDate)
        }
      ];
    }

    const transactionBeforeFirstSalaryPeriod = salaryPeriods.length > 0 ? transactions.filter(t => t.date < salaryPeriods[0].startDate).at(-1) : transactions[0];
    const transactionAfterLastSalaryPeriod = salaryPeriods.length > 0 ? transactions.filter(t => t.date > salaryPeriods[salaryPeriods.length - 1].endDate).at(-1) : transactions[transactions.length - 1];

    if (transactionBeforeFirstSalaryPeriod) {
      const periodStartDate = transactions[0].date;
      const periodEndDate = this.getDayBeforeAtMidnight(salaryPeriods[0].startDate);

      salaryPeriods = [
        {
          label: this.dayFormatter.format(periodStartDate) + ' - ' + this.dayFormatter.format(periodEndDate),
          startDate: periodStartDate,
          endDate: periodEndDate
        },
        ...salaryPeriods
      ]
    }

    if (transactionAfterLastSalaryPeriod) {
      const lastPeriod = salaryPeriods[salaryPeriods.length - 1];
      const periodStartDate = this.nextDayAtMorning(lastPeriod.endDate);
      const periodEndDate = transactions[transactions.length - 1].date;

      salaryPeriods = [
        ...salaryPeriods,
        {
          label: this.dayFormatter.format(periodStartDate) + ' - ' + this.dayFormatter.format(periodEndDate),
          startDate: periodStartDate,
          endDate: periodEndDate
        },
      ]
    }

    return salaryPeriods;
  }

  private getDayBeforeAtMidnight(date: Date) {
    const updatedDate = new Date(date.getTime());
    updatedDate.setHours(23);
    updatedDate.setMinutes(59);
    updatedDate.setSeconds(59);
    updatedDate.setDate(date.getDate() - 1);

    return updatedDate;
  }

  private nextDayAtMorning(date: Date) {
    const updatedDate = new Date(date.getTime());
    updatedDate.setHours(0);
    updatedDate.setMinutes(0);
    updatedDate.setSeconds(0);
    updatedDate.setDate(updatedDate.getDate() + 1);

    return updatedDate;
  }

  private getCategory(transactionDescriptionToCategoryMap: Record<string, string>, transaction: ITransaction): string {
    return transactionDescriptionToCategoryMap[transaction.targetAccountName] || TransactionDescriptionMappingConstants.UnknownCategory;
  }
}
