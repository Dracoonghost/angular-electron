import { Routes } from '@angular/router';
import { RequestListComponent } from './request-list/request-list.component';

export const requestRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: RequestListComponent,
                data: {
                    title: ' NFT Request List'
                }
            },
        ]
    }
];
