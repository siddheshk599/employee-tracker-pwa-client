import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { NotificationService } from '../notification/notification.service';
import { secureStorage } from '../../shared/storage';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuardService implements CanActivate {

  employeePosition;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let storageEmpPosition = secureStorage.getItem('position');
    if (storageEmpPosition === "admin" || storageEmpPosition === 'company_admin')
      return true;
    else {
      this.notificationService.showToast("Only admin users can access this page.", 2000, 'top');
      this.router.navigateByUrl('/tabs/home');
      return false;
    }
  }
}
