import {Component, OnInit} from '@angular/core';
import {TransactionParserService} from "./services/transaction-parser.service";
import {ITransactionDescriptionToCategoryMapping} from "./models/TransactionDescriptionToCategoryMap";
import {NgIf} from "@angular/common";
import {TrendByCategoryComponent} from "./trend-by-category/trend-by-category.component";
import {UnknownCategoriesResponseStatus} from "./models/UnknownCategoriesResponseStatus";
import {MappingComponent} from "./mapping/mapping.component";
import {TransactionDecoratorService} from "./services/transaction-decorator.service";
import {IDecoratedTransaction} from "./models/IDecoratedTransaction";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    NgIf,
    TrendByCategoryComponent,
    MappingComponent
  ],
  standalone: true
})
export class AppComponent implements OnInit {
  transactions: IDecoratedTransaction[] = [];
  title = 'cashflow';

  transactionDescriptionToCategoryMap: Record<string, string> = {};
  unknownCategoriesResponseStatus: UnknownCategoriesResponseStatus = UnknownCategoriesResponseStatus.fileNotYetUploaded;
  unknownCategoriesResponseStatuses = UnknownCategoriesResponseStatus;

  private fileReader = new FileReader();

  constructor(private transactionParser: TransactionParserService, private transactionDecorator: TransactionDecoratorService) {}

  onFileSelected($event: Event) {
    const inputElem = ($event.target as HTMLInputElement);

    if(!inputElem || inputElem.files?.length === 0){
      return;
    }

    const file = inputElem.files![0];

    this.fileReader.readAsText(file, "UTF-8");
    this.fileReader.onload = (evt) => {
      const fileContent = evt.target?.result as string;

      this.transactions = this.transactionDecorator.decorate(this.transactionParser.getTransactions(fileContent), this.transactionDescriptionToCategoryMap);
      this.unknownCategoriesResponseStatus = UnknownCategoriesResponseStatus.askToProvide;
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
