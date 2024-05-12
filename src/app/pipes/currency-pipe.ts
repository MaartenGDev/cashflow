import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  standalone: true,
  name: 'amountAsEuros'
})
export class AmountAsEurosPipe implements PipeTransform {
  transform(amountInCents: number): string {
    return `${Math.abs(amountInCents / 100)}`;
  }
}
