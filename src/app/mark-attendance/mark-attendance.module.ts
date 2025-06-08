import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarkAttendancePageRoutingModule } from './mark-attendance-routing.module';

import { MarkAttendancePage } from './mark-attendance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MarkAttendancePageRoutingModule
  ],
  declarations: [MarkAttendancePage]
})
export class MarkAttendancePageModule {}
