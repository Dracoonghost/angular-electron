import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './gaurd/auth.service';
import { PageNotFoundComponent } from './shared/components';
import { BaseComponent } from './views/layout/base/base.component';
import { NoAiCheckComponent } from './views/no-ai-check/no-ai-check.component';

const routes: Routes = [
  { path: '', loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) },

  {
    path: '',
    component: BaseComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule) },

      { path: 'ssid', loadChildren: () => import('./modules/ssid/ssid.module').then(m => m.SsidModule) },

      { path: 'nft', loadChildren: () => import('./modules/nft/nft.module').then(m => m.NftModule) },

      { path: 'no-ai-check', component: NoAiCheckComponent },

      { path: 'payments', loadChildren: () => import('./modules/payments/payments.module').then(m => m.PaymentsModule) },

      { path: 'staff', loadChildren: () => import('./modules/staff/staff.module').then(m => m.STAFFModule), },

      { path: 'request', loadChildren: () => import('./modules/request/request.module').then(m => m.RequestModule), },

      { path: 'create-nft', loadChildren: () => import('./modules/nftModules/create-nft/create-nft.module').then(m => m.CreateNftModule) },

      { path: 'import-nft', loadChildren: () => import('./modules/nftModules/import-nft/import-nft.module').then(m => m.ImportNFTModule) },

      { path: 'bulk-nft', loadChildren: () => import('./modules/nftModules/bulk-nft/bulk-nft.module').then(m => m.BulkNFTModule) },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponent = [NoAiCheckComponent];
