import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalarySlipPage } from './salary-slip.page';

const routes: Routes = [
  {
    path: '',
    component: SalarySlipPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalarySlipPageRoutingModule {}
