import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentsDashboardComponent } from './payments-dashboard/payments-dashboard.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: PaymentsDashboardComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentsRoutingModule { }
