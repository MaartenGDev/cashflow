import {Injectable} from '@angular/core';
import {ITransaction} from "../models/ITransaction";

@Injectable({
  providedIn: 'root'
})
export class TransactionParserService {
  public getTransactions(rawTransactions: string) : ITransaction[] {
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
          description: cells[17]
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
