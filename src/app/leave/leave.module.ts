import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeavePageRoutingModule } from './leave-routing.module';

import { LeavePage } from './leave.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    LeavePageRoutingModule
  ],
  declarations: [LeavePage]
})
export class LeavePageModule {}
