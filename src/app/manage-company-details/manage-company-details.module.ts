import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageCompanyPageRoutingModule as ManageCompanyDetailsPageRoutingModule } from './manage-company-details-routing.module';

import { ManageCompanyDetailsPage } from './manage-company-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ManageCompanyDetailsPageRoutingModule
  ],
  declarations: [ManageCompanyDetailsPage]
})
export class ManageCompanyDetailsPageModule {}
