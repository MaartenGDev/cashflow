import {Component, OnInit} from '@angular/core';
import {Transaction} from "./models/Transaction";
import {TransactionsParserService} from "./services/transactions-parser.service";
import {ITransactionDescriptionToCategoryMapping} from "./models/TransactionDescriptionToCategoryMap";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  transactions: Transaction[] = [];
  title = 'cashflow';

  transactionDescriptionToCategoryMap: Record<string, string> = {};

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

  ngOnInit(): void {
    fetch('/assets/mapping.json')
        .then(res => res.json())
        .then((res: ITransactionDescriptionToCategoryMapping) => this.transactionDescriptionToCategoryMap = res.mapping)
        .catch(e => {
            console.warn('Could not load mapping, place mapping.json in assets folder.', e);
        })
  }
}
