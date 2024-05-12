import {Transaction} from "../Transaction";

export interface ISpendingTable {
  headerNames: string[];
  rows: ISpendingTableRow[];
}

export interface ISpendingTableRow {
  rowTitle: string;
  cells: ISpendingTableCell[];
  isExpanded: boolean;
}

export interface ISpendingTableCell {
  totalInCents: number;
  transactions: Transaction[]
}
