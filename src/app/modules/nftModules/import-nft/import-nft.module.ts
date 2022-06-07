import { NgModule } from '@angular/core';
import { ImportNFTRoutingModule } from './import-nft-routing.module';
import { ImportNFTComponent } from './import-nft.component';
import { SharedModule } from '../../../shared/shared.module';
import { ImportListComponent } from './import-list/import-list.component';


@NgModule({
  declarations: [
    ImportNFTComponent,
    ImportListComponent
  ],
  imports: [
    SharedModule,
    ImportNFTRoutingModule
  ]
})
export class ImportNFTModule { }
