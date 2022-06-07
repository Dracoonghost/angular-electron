import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Certificate } from 'crypto';
import { CertificateComponent } from './certificate/certificate.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { BridgeComponent } from './bridge/bridge.component';
import { SearchNftsComponent } from './search-nfts/search-nfts.component';

const routes: Routes = [
    {
    path:'certificate',
    component: CertificateComponent
  },
  {
    path:'invoice',
    component:InvoiceComponent
  },
  {
    path:'invoiceList',
    component:InvoiceListComponent
  },
  {
    path:'bridge',
    component:BridgeComponent
  },
  {
    path: 'search',
    component: SearchNftsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NftRoutingModule { }
