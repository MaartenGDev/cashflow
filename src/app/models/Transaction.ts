export interface Transaction {
  date: Date;
  sourceAccountIBAN: string;
  targetAccountIBAN: string;
  targetAccountName: string;
  amountOfCents: number;
  description: string;
  monthName: string;
}
