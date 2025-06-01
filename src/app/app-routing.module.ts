import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './services/auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'home',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  },
  {
    path: 'mark-attendance/:employeeId',
    redirectTo: '/tabs/mark-attendance/:employeeId',
    pathMatch: 'full'
  },
  {
    path: 'leave/:employeeId',
    redirectTo: '/tabs/leave/:employeeId',
    pathMatch: 'full'
  },
  {
    path: 'report/:employeeId',
    redirectTo: '/tabs/report/:employeeId',
    pathMatch: 'full'
  },
  {
    path: 'add-employee',
    redirectTo: '/tabs/add-employee',
    pathMatch: 'full'
  },
  {
    path: 'edit-employee/:employeeId',
    redirectTo: '/tabs/edit-employee/:employeeId',
    pathMatch: 'full'
  },
  {
    path: 'employee',
    redirectTo: '/tabs/employee',
    pathMatch: 'full'
  },
  {
    path: 'tabs/login',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'no-internet',
    redirectTo: '/tabs/no-internet',
    pathMatch: 'full'
  },
  {
    path: 'manage-company',
    redirectTo: '/tabs/manage-company',
    pathMatch: 'full'
  },
  {
    path: 'settings',
    redirectTo: '/tabs/settings',
    pathMatch: 'full'
  },
  {
    path: 'notifications',
    redirectTo: '/tabs/notifications',
    pathMatch: 'full'
  },
  {
    path: 'manage-attendance',
    redirectTo: '/tabs/manage-attendance',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/tabs/not-found',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'reload' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }