import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { NotificationService } from '../notification/notification.service';
import { secureStorage } from '../../shared/storage';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let loggedIn = secureStorage.getItem('loggedIn');

    if (loggedIn === "true")
      return true;
    else {
      this.router.navigateByUrl('/login');
      return false;
    }
  }
}
