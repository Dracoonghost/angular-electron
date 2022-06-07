import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { staffRoutes } from './staff.routing';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StaffListComponent } from './staff-list/staff-list.component';
import { StaffMemberComponent } from './staff-member/staff-member.component';
import { StaffMemberAddComponent } from './staff-member-add/staff-member-add.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        // BrowserModule,
        RouterModule.forChild(staffRoutes)
    ],
    declarations: [
        StaffListComponent,
        StaffMemberComponent,
        StaffMemberAddComponent
    ]
})
export class STAFFModule { }
