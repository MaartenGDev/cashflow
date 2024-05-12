import {Transaction} from "../Transaction";

export interface ISpendingTableColumn {
  label: string;
  isSummaryColumn: boolean;
}

export interface ISpendingTable {
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
  transactions: Transaction[]
  isSummaryCell: boolean;
}
