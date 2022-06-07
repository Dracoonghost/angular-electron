import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentsRoutingModule } from './payments-routing.module';
import { PaymentsDashboardComponent } from './payments-dashboard/payments-dashboard.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    PaymentsRoutingModule,
    SharedModule
  ]
})
export class PaymentsModule { }
