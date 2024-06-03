export interface ITransaction {
  date: Date;
  sourceAccountIBAN: string;
  targetAccountIBAN: string;
  targetAccountName: string;
  amountOfCents: number;
  description: string;
}
