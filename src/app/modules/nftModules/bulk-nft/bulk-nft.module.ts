import { NgModule } from '@angular/core';
import { BulkNFTRoutingModule } from './bulk-nft-routing.module';
import { BulkNFTComponent } from './bulk-nft.component';
import { ListBulkNFTComponent } from './list-bulk-nft/list-bulk-nft.component';
import { ViewBulkNFTComponent } from './view-bulk-nft/view-bulk-nft.component';
import { SharedModule } from '../../../shared/shared.module';


@NgModule({
  declarations: [
    BulkNFTComponent,
    ListBulkNFTComponent,
    ViewBulkNFTComponent
  ],
  imports: [
    BulkNFTRoutingModule,
    SharedModule
  ]
})
export class BulkNFTModule { }
