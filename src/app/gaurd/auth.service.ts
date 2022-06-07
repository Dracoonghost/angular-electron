import { Injectable } from '@angular/core';
import { CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import { SpinnerService } from '../services/spinner/spinner.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router,private loader: SpinnerService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.loader.hide();
    if (localStorage.getItem('currentJWT')) {
      // logged in so return true
      return true;
    }

    // not logged in so redirect to login page with the return url
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
