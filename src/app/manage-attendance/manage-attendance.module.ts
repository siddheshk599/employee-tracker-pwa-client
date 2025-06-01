import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageAttendancePageRoutingModule } from './manage-attendance-routing.module';

import { ManageAttendancePage } from './manage-attendance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageAttendancePageRoutingModule
  ],
  declarations: [ManageAttendancePage]
})
export class ManageAttendancePageModule {}
