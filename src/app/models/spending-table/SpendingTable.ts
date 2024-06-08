import {ITransaction} from "../ITransaction";

export interface ISpendingTableColumn {
  label: string;
  isSummaryColumn: boolean;
}

export interface ISpendingTable {
  fixedColumns: ISpendingTableColumn[];
  columns: ISpendingTableColumn[];
  rows: ISpendingTableRow[];
}

export interface ISpendingTableRow {
  rowTitle: string;
  cells: ISpendingTableCell[];
  isExpanded: boolean;
  totalInCents: number;
  averageInCents: number;
}

export interface ISpendingTableCell {
  totalInCents: number;
  transactions: ITransaction[]
  isSummaryCell: boolean;
}
