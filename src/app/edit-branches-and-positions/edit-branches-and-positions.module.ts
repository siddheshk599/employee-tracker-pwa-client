import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditBranchesAndPositionsPageRoutingModule as EditBranchesAndPositionsPageRoutingModule } from './edit-branches-and-positions-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditBranchesAndPositionsPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: []
})
export class EditBranchesAndPositionsPageModule {}
