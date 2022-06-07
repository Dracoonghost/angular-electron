import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { NftRoutingModule } from './nft-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CertificateComponent } from './certificate/certificate.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { SharedModule } from '../../shared/shared.module';
import { BridgeComponent } from './bridge/bridge.component';
import { SearchNftsComponent } from './search-nfts/search-nfts.component';

@NgModule({
  declarations: [
    CertificateComponent,
    InvoiceComponent,
    InvoiceListComponent,
    BridgeComponent,
    SearchNftsComponent,
  ],
  imports: [
    SharedModule,
    CommonModule,
    NftRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    DatePipe
  ]
})
export class NftModule { }
