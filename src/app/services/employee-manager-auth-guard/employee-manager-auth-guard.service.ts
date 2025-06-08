import { secureStorage } from './../../shared/storage';
import { NotificationService } from './../notification/notification.service';
import { Router, ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmployeeManagerAuthGuardService  implements CanActivate {

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let storageEmpPosition = secureStorage.getItem('position');
    if (storageEmpPosition === "employee" || storageEmpPosition === 'branch_manager')
      return true;
    else {
      this.notificationService.showToast("Only employees and branch managers can access this page.", 2000, 'top');
      this.router.navigateByUrl('/tabs/home');
      return false;
    }
  }
}
