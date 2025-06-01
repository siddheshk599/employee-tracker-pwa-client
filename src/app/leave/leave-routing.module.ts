import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeavePage } from './leave.page';

const routes: Routes = [
  {
    path: '',
    component: LeavePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeavePageRoutingModule {}
