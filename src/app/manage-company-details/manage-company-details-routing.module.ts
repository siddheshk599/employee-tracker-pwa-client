import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageCompanyDetailsPage } from './manage-company-details.page';

const routes: Routes = [
  {
    path: '',
    component: ManageCompanyDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageCompanyPageRoutingModule {}
