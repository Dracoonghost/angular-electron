import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { requestRoutes } from './request-routing.module';
import { RequestListComponent } from './request-list/request-list.component';
import { RequestDetailedViewComponent } from './request-detailed-view/request-detailed-view.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    RequestListComponent,
    RequestDetailedViewComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(requestRoutes)
  ]
})
export class RequestModule { }
