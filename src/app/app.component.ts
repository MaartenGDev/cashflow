import { Component } from '@angular/core';
import {Transaction} from "./models/Transaction";
import {TransactionsParserService} from "./services/transactions-parser.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  transactions: Transaction[] = [];
  title = 'cashflow';

  private fileReader = new FileReader();

  constructor(private transactionsParser: TransactionsParserService) {}

  onFileSelected($event: Event) {
    const inputElem = ($event.target as HTMLInputElement);

    if(!inputElem || inputElem.files?.length === 0){
      return;
    }

    const file = inputElem.files![0];

    this.fileReader.readAsText(file, "UTF-8");
    this.fileReader.onload = (evt) => {
      const fileContent = evt.target?.result as string;

      this.transactions = this.transactionsParser.getTransactions(fileContent);
    }
  }
}
