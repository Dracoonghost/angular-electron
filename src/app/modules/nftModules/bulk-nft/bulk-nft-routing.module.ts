import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BulkNFTComponent } from './bulk-nft.component';
import { ListBulkNFTComponent } from './list-bulk-nft/list-bulk-nft.component';
import { ViewBulkNFTComponent } from './view-bulk-nft/view-bulk-nft.component';

const routes: Routes = [
  { path: '', component: BulkNFTComponent },
  { path: 'list-bulk-nft', component: ListBulkNFTComponent },
  { path: 'view-bulk/:batchID', component: ViewBulkNFTComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BulkNFTRoutingModule { }
