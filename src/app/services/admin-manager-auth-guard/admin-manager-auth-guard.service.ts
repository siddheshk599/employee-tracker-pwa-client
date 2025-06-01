import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { NotificationService } from '../notification/notification.service';
import { secureStorage } from '../../shared/storage';

@Injectable({
  providedIn: 'root'
})
export class AdminManagerAuthGuardService implements CanActivate {

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let storageEmpPosition = secureStorage.getItem('position');
    if (storageEmpPosition === "admin" || storageEmpPosition === 'company_admin' || storageEmpPosition === "branch_manager")
      return true;
    else {
      this.notificationService.showToast("Only admins and managers can access this page.", 2000, 'top');
      this.router.navigateByUrl('/tabs/home');
      return false;
    }
  }
}
