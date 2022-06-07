import { Routes } from '@angular/router';
import { StaffListComponent } from './staff-list/staff-list.component';
import { StaffMemberComponent } from './staff-member/staff-member.component';
import { StaffMemberAddComponent } from './staff-member-add/staff-member-add.component';

export const staffRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: StaffListComponent,
                data: {
                    title: ' Staff'
                }
            },
            {
                path: 'profile/:id',
                component: StaffMemberComponent,
                data: {
                    title: ' Staff Member'
                }
            },
            {
                path: 'new',
                component: StaffMemberAddComponent,
                data: {
                    title: ' Staff Member'
                }
            },
        ]
    }
];
