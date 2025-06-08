import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditBranchesAndPositionsPage } from './edit-branches-and-positions.page';

const routes: Routes = [
  {
    path: '',
    component: EditBranchesAndPositionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditBranchesAndPositionsPageRoutingModule {}
