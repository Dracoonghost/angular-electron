import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { AuthComponent } from './auth.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSigKeyComponent } from './multi-sig-key/multi-sig-key.component';


@NgModule({
  declarations: [
    LoginComponent,
    SignUpComponent,
    AuthComponent,
    MultiSigKeyComponent,
    
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    ReactiveFormsModule,

  ]
})
export class AuthModule { }
