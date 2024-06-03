import {bootstrapApplication} from "@angular/platform-browser";
import {AppComponent} from "./app/app.component";
import {LOCALE_ID} from "@angular/core";
import {provideCharts, withDefaultRegisterables} from "ng2-charts";
import {provideRouter} from "@angular/router";
import localeData from '@angular/common/locales/nl';
import {registerLocaleData} from "@angular/common";


registerLocaleData(localeData);

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'nl-NL'
    },
    provideCharts(withDefaultRegisterables()),
    provideRouter([
      { path: '**', component: AppComponent },
    ])
  ]
})
  .catch(err => console.error(err))
