import { Component, OnInit } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../environments/environment';
import { SpinnerService } from './services/spinner/spinner.service';
import * as Sentry from '@sentry/angular';
import { BrowserTracing } from '@sentry/tracing';

declare let $: any;
declare const openpgp: any;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public loading = false;
  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    public spinner: SpinnerService
  ) {

    Sentry.configureScope((scope) => {
      scope.setTag('service', 'renderer');
      // scope.clear();
    });

    Sentry.init({
      dsn: 'https://b68a3b9f9e3c4546a9ebc186744c3e68@o931102.ingest.sentry.io/6395497',
      integrations: [
        // Registers and configures the Tracing integration,
        // which automatically instruments your application to monitor its
        // performance, including custom Angular routing instrumentation
        new BrowserTracing({
          tracingOrigins: ['http://localhost:4200'],
          routingInstrumentation: Sentry.routingInstrumentation,
        }),
      ],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
    });


    this.translate.setDefaultLang('en');
    console.log('APP_CONFIG', APP_CONFIG);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
    } else {
      console.log('Run in browser');
    }
  }

  notImplemented(x) {
    return new Promise((resolve, reject) => {
      if (x) {
        resolve(1);
      } else {
        reject(0);
      }
    });
  }


  ngOnInit() {
    this.notImplemented(false);
    // const interval = setInterval(function() {
    //   console.log(openpgp);
    //   }, 5000);
    console.log(openpgp);
  }

}
