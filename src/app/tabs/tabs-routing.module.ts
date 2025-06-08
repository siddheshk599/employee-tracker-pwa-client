import { EmployeeManagerAuthGuardService } from './../services/employee-manager-auth-guard/employee-manager-auth-guard.service';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminAuthGuardService } from '../services/admin-auth-guard/admin-auth-guard.service';
import { AdminManagerAuthGuardService } from '../services/admin-manager-auth-guard/admin-manager-auth-guard.service';
import { AuthGuardService } from '../services/auth-guard/auth-guard.service';

import { TabsPage } from './tabs.page';

const routes: Routes = [{
  path: 'tabs',
  component: TabsPage,
  children: [
    {
      path: 'home',
      children: [
        {
          path: '',
          loadChildren: () => import('../home/home.module').then(m => m.HomePageModule),
          canActivate: [AuthGuardService]
        }
      ]
    },
    {
      path: 'report/:employeeId',
      children: [
        {
          path: '',
          loadChildren: () => import('../report/report.module').then(m => m.ReportPageModule),
          canActivate: [AuthGuardService]
        }
      ]
    },
    {
      path: 'employee',
      children: [
        {
          path: '',
          loadChildren: () => import('../employee/employee.module').then(m => m.EmployeePageModule),
          canActivate: [AuthGuardService, AdminManagerAuthGuardService]
        }
      ]
    },
    {
      path: 'settings',
      children: [
        {
          path: '',
          loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule),
          canActivate: [AuthGuardService]
        }
      ]
    },
    {
      path: 'mark-attendance/:employeeId',
      loadChildren: () => import('../mark-attendance/mark-attendance.module').then( m => m.MarkAttendancePageModule),
      canActivate: [AuthGuardService, EmployeeManagerAuthGuardService],
    },
    {
      path: 'leave/:employeeId',
      loadChildren: () => import('../leave/leave.module').then( m => m.LeavePageModule),
      canActivate: [AuthGuardService, EmployeeManagerAuthGuardService]
    },
    {
      path: 'manage-company-details',
      loadChildren: () => import('../manage-company-details/manage-company-details.module').then(m => m.ManageCompanyDetailsPageModule),
      canActivate: [AuthGuardService, AdminAuthGuardService]
    },
    {
      path: 'add-employee',
      loadChildren: () => import('../add-employee/add-employee.module').then( m => m.AddEmployeePageModule),
      canActivate: [AuthGuardService, AdminManagerAuthGuardService]
    },
    {
      path: 'edit-employee/:employeeId',
      loadChildren: () => import('../edit-employee/edit-employee.module').then( m => m.EditEmployeePageModule),
      canActivate: [AuthGuardService, AdminManagerAuthGuardService]
    },
    {
      path: 'no-internet',
      loadChildren: () => import('../no-internet/no-internet.module').then( m => m.NoInternetPageModule)
    },
    {
      path: 'notifications',
      loadChildren: () => import('../notifications/notifications.module').then( m => m.NotificationsPageModule),
      canActivate: [AuthGuardService]
    },
    {
      path: 'manage-attendance',
      loadChildren: () => import('../manage-attendance/manage-attendance.module').then( m => m.ManageAttendancePageModule),
      canActivate: [AuthGuardService, AdminManagerAuthGuardService]
    },
    {
      path: 'not-found',
      loadChildren: () => import('../not-found/not-found.module').then( m => m.NotFoundPageModule)
    }
  ]
}, {
  path: '',
  redirectTo: '/tabs/home',
  pathMatch: 'full'
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
