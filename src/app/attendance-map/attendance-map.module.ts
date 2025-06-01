import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AttendanceMapPageRoutingModule } from './attendance-map-routing.module';

import { AttendanceMapPage } from './attendance-map.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AttendanceMapPageRoutingModule
  ],
  declarations: []
})
export class AttendanceMapPageModule {}
