import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditEmployeePageRoutingModule } from './edit-employee-routing.module';

import { EditEmployeePage } from './edit-employee.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    EditEmployeePageRoutingModule
  ],
  declarations: [EditEmployeePage]
})
export class EditEmployeePageModule {}
