import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CreateNftRoutingModule } from './create-nft-routing.module';
import { CreateNftComponent } from './create-nft.component';
import { SharedModule } from '../../../shared/shared.module';
import { PreviewNftComponent } from './preview-nft/preview-nft.component';
import { ListNftComponent } from './list-nft/list-nft.component';


@NgModule({
  declarations: [
    CreateNftComponent,
    PreviewNftComponent,
    ListNftComponent
  ],
  imports: [
    CreateNftRoutingModule,
    SharedModule,
  ],
  providers: [
    DatePipe
  ]
})
export class CreateNftModule { }
