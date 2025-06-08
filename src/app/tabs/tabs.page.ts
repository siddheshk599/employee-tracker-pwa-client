import { secureStorage } from 'src/app/shared/storage';
import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage {

  storageEmpPosition: string;
  storageEmpId: string

  constructor() { }

  ionViewWillEnter(){
    this.storageEmpPosition = secureStorage.getItem('position');
    this.storageEmpId = secureStorage.getItem('empId');
  }

  ionViewWillLeave(){
    this.storageEmpPosition = undefined;
  }

}
