import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImportListComponent } from './import-list/import-list.component';
import { ImportNFTComponent } from './import-nft.component';

const routes: Routes = [
  { path: '', component: ImportNFTComponent },
  { path: 'list', component : ImportListComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImportNFTRoutingModule { }
