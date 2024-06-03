import {Component, Input, OnInit} from '@angular/core';
import {ITransaction} from "../models/ITransaction";
import {AmountAsEurosPipe} from "../pipes/currency-pipe";
import {CurrencyPipe, KeyValuePipe, NgForOf} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-mapping',
  standalone: true,
  imports: [
    AmountAsEurosPipe,
    CurrencyPipe,
    NgForOf,
    FormsModule,
    KeyValuePipe
  ],
  templateUrl: './mapping.component.html',
  styleUrl: './mapping.component.scss'
})
export class MappingComponent implements OnInit {
  private localStorageCategoriesKey = 'categories';
  private localStorageAccountNameToCategoryKey = 'accountNameToCategoryMapping';

  public transactionsWithUnknownCategory: ITransaction[] = [];

  @Input()
  public set transactions(transactions: ITransaction[]){
     this.transactionsWithUnknownCategory = transactions
       .filter(t => t.description);
  }

  public categoryNames: string[] = [];
  public accountNameToCategoryMapping: Record<string, string> = {};
  public accountNameInputValue: string = '';
  public categoryInputValue: string = '';

  ngOnInit(): void {
    this.accountNameToCategoryMapping = this.getAccountNameToCategoryMapping();
  }

  addCategory(categoryName: string){
    const categoryNames = this.getCategoryNames();

    if(categoryNames.includes(categoryName)){
      return;
    }

    this.setCategoryNames([categoryName, ...categoryNames])
  }

  addAccountNameToCategoryMapping(accountName: string, categoryName: string) {
    const accountNameToCategoryMapping = this.getAccountNameToCategoryMapping();

    if(accountNameToCategoryMapping.hasOwnProperty(accountName)){
      return;
    }

    this.setAccountNameToCategoryMap({
      [accountName]: categoryName,
      ...accountNameToCategoryMapping
    });
    this.categoryInputValue = '';
  }

  removeCategory(accountName: string) {
    if(!confirm(`Are you sure you want to delete the mapping for "${accountName}"? All mapped transactions will be set to unknown.`)){
      return;
    }

    const updatedAccountNameToCategoryMap = {...this.getAccountNameToCategoryMapping()};

    delete updatedAccountNameToCategoryMap[accountName];

    this.setAccountNameToCategoryMap(updatedAccountNameToCategoryMap);
  }

  setAccountNameToCategoryMap(accountNameToCategoryMapping: Record<string, string>) {
    localStorage.setItem(this.localStorageAccountNameToCategoryKey, JSON.stringify(accountNameToCategoryMapping));

    this.accountNameToCategoryMapping = accountNameToCategoryMapping;
  }

  setCategoryNames(categoryNames: string[]) {
    localStorage.setItem(this.localStorageAccountNameToCategoryKey, JSON.stringify(categoryNames));

    this.categoryNames = categoryNames;
  }

  getAccountNameToCategoryMapping(): Record<string, string> {
    return JSON.parse(localStorage.getItem(this.localStorageAccountNameToCategoryKey) || '{}');
  }

  getCategoryNames(): string[] {
    return JSON.parse(localStorage.getItem(this.localStorageCategoriesKey) || '[]');
  }
}
