import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EmployeePageRoutingModule } from './employee-routing.module';
import { EmployeePage } from './employee.page';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmployeePageRoutingModule,
    NgxPaginationModule
  ],
  declarations: [EmployeePage]
})
export class EmployeePageModule {}
