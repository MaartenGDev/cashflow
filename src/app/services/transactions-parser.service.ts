import {Injectable} from '@angular/core';
import {Transaction} from "../models/Transaction";

@Injectable({
  providedIn: 'root'
})
export class TransactionsParserService {
  public getTransactions(rawTransactions: string) : Transaction[] {
    return rawTransactions
      .split("\n")
      .filter(rawTransaction => rawTransaction.split(",").length > 1)
      .map(rawTransaction => {
        const cells = rawTransaction.split(",");

        return {
          date: this.getDateFromString(cells[0]),
          sourceAccountIBAN: cells[1],
          targetAccountIBAN: cells[2],
          targetAccountName: cells[3] || this.extractReceiverFromDescription(cells[17]),
          amountOfCents: this.getAsCents(cells[10]),
          description: cells[17],
          monthName: new Intl.DateTimeFormat('en-US', {month: "long", year: "numeric"}).format(this.getDateFromString(cells[0]))
        };
      });
  }

  private getDateFromString(dateAsString: string): Date {
    const [date, month, year] = dateAsString.split("-").map(s => parseInt(s, 10));

    return new Date(year, month - 1, date);
  }

  private getAsCents(euroAmount: string) {
    const [euros, cents] = euroAmount.split(".").map(s => parseInt(s, 10));

    const correctedCents = euros < 0 ? cents * -1 : cents;

    return (euros * 100) + correctedCents;
  }

  private extractReceiverFromDescription(transactionDescription: string) {
    if(!transactionDescription.includes(">")){
      return transactionDescription;
    }

    return transactionDescription.substring(0, transactionDescription.indexOf(">")).replace('\'', '').trim();
  }
}
