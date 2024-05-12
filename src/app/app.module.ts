import {LOCALE_ID, NgModule} from '@angular/core';
import { registerLocaleData } from '@angular/common'
import localeData from '@angular/common/locales/nl';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TrendByCategoryComponent } from './trend-by-category/trend-by-category.component';
import {AmountAsEurosPipe} from "./pipes/currency-pipe";

registerLocaleData(localeData);

@NgModule({
  declarations: [
    AppComponent,
    TrendByCategoryComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        AmountAsEurosPipe
    ],
  providers: [{
    provide: LOCALE_ID,
    useValue: 'nl-NL'
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
