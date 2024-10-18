import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { fromEvent } from 'rxjs';
import { getCookie } from './utils/cookie';

@Component({
  selector: 'espacios-fisicos-mf',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'registro-gestion';

  constructor(
    private translate: TranslateService,
  ) {
    validateLang(this.translate);
  }
}

export function validateLang(translate: TranslateService) {
  let whatLang$ = fromEvent(window, 'lang');
  let lang = getCookie('lang') || 'es';
  whatLang$.subscribe((x:any) => {
    lang = x['detail']['answer'];
    translate.setDefaultLang(lang)
  });
  translate.setDefaultLang(getCookie('lang') || 'es');
}