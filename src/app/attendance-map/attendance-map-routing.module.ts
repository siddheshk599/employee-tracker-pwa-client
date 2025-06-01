import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AttendanceMapPage } from './attendance-map.page';

const routes: Routes = [
  {
    path: '',
    component: AttendanceMapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AttendanceMapPageRoutingModule {}
