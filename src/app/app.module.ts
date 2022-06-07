import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler  } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule, routingComponent } from './app-routing.module';
// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppComponent } from './app.component';
import { LayoutModule } from './views/layout/layout.module';
import { AuthGuard } from './gaurd/auth.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxFsModule } from 'ngx-fs';
import { jwtRequestInterceptor, jwtResponseInterceptor } from './interceptors/jwtinterceptor.service';
import { ToastrModule } from 'ngx-toastr';
import {MaterialModule} from './modules/material/material.module';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as Sentry from '@sentry/angular';
import { TransferNftComponent } from './modules/nftModules/transfer-nft/transfer-nft.component';

//import { ScrollingModule } from '@angular/cdk/scrolling';
//import { NoAiCheckComponent } from './views/no-ai-check/no-ai-check.component';


// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader => new TranslateHttpLoader(http, './assets/i18n/', '.json');

@NgModule({
  declarations: [AppComponent, routingComponent, TransferNftComponent],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    AppRoutingModule,
    LayoutModule,
    NgxFsModule,
    MatDialogModule,
    MaterialModule,
    ToastrModule.forRoot(),
  //  ScrollingModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [AuthGuard,
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: false,
      }),
    },
    { provide: HTTP_INTERCEPTORS, useClass: jwtRequestInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: jwtResponseInterceptor, multi: true },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true } },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },],
  bootstrap: [AppComponent]
})
export class AppModule { }
