import {ITransaction} from "./ITransaction";
import {ISalaryPeriod} from "./ISalaryPeriod";

export interface IDecoratedTransaction extends ITransaction {
  salaryMonthName: string;
  monthName: string;
  category: string;
  period: ISalaryPeriod;
}
