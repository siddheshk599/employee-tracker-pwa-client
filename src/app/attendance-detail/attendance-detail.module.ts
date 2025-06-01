import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AttendanceDetailPageRoutingModule } from './attendance-detail-routing.module';

import { AttendanceDetailPage } from './attendance-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AttendanceDetailPageRoutingModule
  ],
  declarations: []
})
export class AttendanceDetailPageModule {}
