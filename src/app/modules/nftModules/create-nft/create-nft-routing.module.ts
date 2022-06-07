import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateNftComponent } from './create-nft.component';
import { ListNftComponent } from './list-nft/list-nft.component';
import { PreviewNftComponent } from './preview-nft/preview-nft.component';

const routes: Routes = [
  { path: '', component: CreateNftComponent },
  { path: 'previewNFT', component: PreviewNftComponent },
  { path: 'listNFT', component: ListNftComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateNftRoutingModule { }
