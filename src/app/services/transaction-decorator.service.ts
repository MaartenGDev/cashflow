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
    let salaryPeriods: ISalaryPeriod[] = [];

    let previousSalaryPeriodStartDate: null|Date = null;

    for (const transaction of transactions) {
      if(transaction.amountOfCents > 200_000 && this.getCategory(transactionDescriptionToCategoryMap, transaction) === "Salary"){
        if(previousSalaryPeriodStartDate){
          salaryPeriods.push({
            startDate: previousSalaryPeriodStartDate,
            endDate: this.getDayBeforeAtMidnight(transaction.date),
            label: this.monthFormatter.format(previousSalaryPeriodStartDate)
          });
        }

        previousSalaryPeriodStartDate = transaction.date;
      }
    }

    const transactionBeforeFirstSalaryPeriod = salaryPeriods.length > 0 ? transactions.find(t => t.date < salaryPeriods[0].startDate) : transactions[0];
    const transactionAfterLastSalaryPeriod = salaryPeriods.length > 0 ? transactions.find(t => t.date > salaryPeriods[salaryPeriods.length -1].endDate) : transactions[transactions.length -1];

    if(transactionBeforeFirstSalaryPeriod){
      const periodStartDate = transactions[0].date;

      salaryPeriods = [
        {
          label: this.monthFormatter.format(periodStartDate),
          startDate: periodStartDate,
          endDate: this.getDayBeforeAtMidnight(salaryPeriods[0].startDate)
        },
        ...salaryPeriods
      ]
    }

    if(transactionAfterLastSalaryPeriod){
      const lastPeriod = salaryPeriods[salaryPeriods.length - 1];
      const periodStartDate = this.nextDayAtMorning(lastPeriod.endDate);

      salaryPeriods = [
        ...salaryPeriods,
        {
          label: this.monthFormatter.format(periodStartDate),
          startDate: periodStartDate,
          endDate: transactions[transactions.length -1].date
        },
      ]
    }

    return salaryPeriods;
  }

  private getDayBeforeAtMidnight(date: Date){
    const updatedDate = new Date(date.getTime());
    updatedDate.setHours(23);
    updatedDate.setMinutes(59);
    updatedDate.setSeconds(59);
    updatedDate.setDate(date.getDate() - 1);

    return updatedDate;
  }

  private nextDayAtMorning(date: Date){
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
