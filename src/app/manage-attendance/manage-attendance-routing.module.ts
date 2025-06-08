import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageAttendancePage } from './manage-attendance.page';

const routes: Routes = [
  {
    path: '',
    component: ManageAttendancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageAttendancePageRoutingModule {}
