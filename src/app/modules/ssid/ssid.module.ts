import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SsidRoutingModule } from './ssid-routing.module';
import { CreateSsidComponent } from './create-ssid/create-ssid.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SsidListComponent } from './ssid-list/ssid-list.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { SharedModule } from '../../shared/shared.module';
import { CreateClientComponent } from './utils/create-client/create-client.component';


@NgModule({
  declarations: [
    CreateSsidComponent,
    SsidListComponent,
    CreateClientComponent
  ],
  imports: [
    CommonModule,
    SsidRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    CarouselModule,
    SharedModule
  ]
})
export class SsidModule { }
