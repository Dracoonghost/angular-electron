import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateSsidComponent } from './create-ssid/create-ssid.component';
import { SsidListComponent } from './ssid-list/ssid-list.component';

const routes: Routes = [
  {
    path: 'list',
    component: SsidListComponent
  },
  {
    path: 'create',
    component: CreateSsidComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SsidRoutingModule { }
