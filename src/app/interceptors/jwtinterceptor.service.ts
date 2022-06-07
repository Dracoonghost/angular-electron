/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpResponse, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map, filter, tap } from 'rxjs/operators';
import { CommonService } from '../services/common/common.service';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { AclStorageService } from '../services/acl-storage/acl-storage.service';
import { SpinnerService } from '../services/spinner/spinner.service';

@Injectable()
export class jwtRequestInterceptor implements HttpInterceptor {
    constructor(
        private router: Router,
    ) {

    }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // if(req.headers.get('skip')){
        //     return next.handle(req);

        // }
        if (req.headers.get('skip')) {
            req = req.clone({ headers: req.headers.delete('skip', 'true') });
            console.log(req.headers);
            return next.handle(req);
        }
        console.log('Request Intercepted');

        return from(this.handle(req, next));
    }

    async handle(req, next) {
        const JWT = localStorage.getItem('currentJWT');
        return next.handle(req.clone({ setHeaders: { Authorization: 'Bearer ' + JWT } })).toPromise();
    }
}

@Injectable()
export class jwtResponseInterceptor implements HttpInterceptor {
    constructor(
        private common: CommonService,
        private router: Router,
        public acl: AclStorageService,
        private loader: SpinnerService
    ) {

    }
    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        if (req.headers.get('skip')) {
            return next.handle(req);

        }
        console.log('Intercepted');
        return next.handle(req).pipe(
            tap(async (evt) => {
                if (evt instanceof HttpResponse) {
                    console.log(evt);
                    const token = evt.body.token;
                    if (token) {
                        localStorage.setItem('currentJWT', token);
                        this.acl.getDecodedUserToken(token);
                    }

                }
            }, async (exception) => {
                if (exception instanceof HttpErrorResponse) {

                    console.log(exception);
                    this.loader.hide();
                    if (exception.status === 401) {
                        console.log('login again');
                        // alert('Login Again!!')
                        localStorage.setItem('currentJWT', null);
                        this.router.navigate(['/login']);
                        // window.location.reload();
                    }
                }
            }
            ));

    }
}
