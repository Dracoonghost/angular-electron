import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LocationSearchComponent } from './components/location-search/location-search.component';
import { EncryptPrivateKeysComponent } from './components/encrypt-private-keys/encrypt-private-keys.component';
import { PaymentsDashboardComponent } from '../modules/payments/payments-dashboard/payments-dashboard.component';
import { AvaliableBlockChainComponent } from './components/avaliable-block-chain/avaliable-block-chain.component';
import { AvaliableSSIDComponent } from './components/avaliable-ssid/avaliable-ssid.component';
import { CertificateNftComponent } from './components/certificate-nft/certificate-nft.component';
import { InvoiceComponent } from './components/invoice/invoice.component';
import { LogoutComponent } from './components/logout/logout.component';
import { RaiseTicketComponent } from './components/raise-ticket/raise-ticket.component';
import { SelectClientIDComponent } from './components/select-client-id/select-client-id.component';

@NgModule({
  declarations: [
    PageNotFoundComponent,
    WebviewDirective,
    LocationSearchComponent,
    EncryptPrivateKeysComponent,
    // payments Dashboard component can be added back to payment module as discuss with captain
    PaymentsDashboardComponent,
    AvaliableBlockChainComponent,
    AvaliableSSIDComponent,
    CertificateNftComponent,
    InvoiceComponent,
    LogoutComponent,
    RaiseTicketComponent,
    SelectClientIDComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    TranslateModule,
    WebviewDirective,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LocationSearchComponent,
    EncryptPrivateKeysComponent,
    PaymentsDashboardComponent,
    AvaliableBlockChainComponent,
    LogoutComponent,
    RaiseTicketComponent,
    SelectClientIDComponent

  ]
})
export class SharedModule { }
