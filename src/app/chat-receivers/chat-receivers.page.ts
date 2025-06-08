import { functions } from './../shared/functions';
import { ModalController } from '@ionic/angular';
import { Component } from '@angular/core';
import { secureStorage } from '../shared/storage';
import { NotificationService } from '../services/notification/notification.service';
import Employee from '../shared/models/employee.model';
import { EmployeeService } from '../services/employee/employee.service';

@Component({
  selector: 'app-chat-receivers',
  templateUrl: './chat-receivers.page.html',
  styleUrls: ['./chat-receivers.page.scss'],
})
export class ChatReceiversPage {

  storageEmpId: string;
  storageEmpPosition: string;
  errorMsg;
  chatReceivers: Employee[];
  sharedFunctions = functions;

  constructor(
    private modalCtrl: ModalController,
    private notificationService: NotificationService,
    private employeeService: EmployeeService
  ) {}

  ionViewWillEnter(): void {
    this.storageEmpId = secureStorage.getItem('empId');
    this.storageEmpPosition = secureStorage.getItem('position');
    this.getChatReceivers(this.storageEmpId, secureStorage.getItem('companyId'));
  }

  ionViewWillLeave(): void {
    this.errorMsg = undefined;
  }

  dismissModal(): void {
    this.modalCtrl.dismiss();
  }

  getChatReceivers(empId: string, companyId: string): void {
    if (this.storageEmpPosition === 'admin') {
      this.employeeService.getAllEmployeeDetails('?isActive=true&hasApproval=true').subscribe(
        (chatReceivers) => {
          this.chatReceivers = [...chatReceivers.filter((receiver) => receiver._id != this.storageEmpId)];
        },
        (error) => {
          this.errorMsg = <any>error;

          this.notificationService.showErrorToast('Error in getting employee details. Please try again after some time.', 2000, 'top');
        }
      );
    } else if (this.storageEmpPosition === 'company_admin') {
      this.employeeService.getChatReceivers(empId, companyId)
      .subscribe(
        (chatReceivers) => {
          this.chatReceivers = [...chatReceivers];
        },
        (error) => {
          this.errorMsg = <any>error;

          this.notificationService.showErrorToast('Error in getting employee details. Please try again after some time.', 2000, 'top');
        }
      );

    } else {
      this.employeeService.getChatReceivers(empId, companyId)
      .subscribe(
        (chatReceivers) => {
          this.chatReceivers = [...chatReceivers.filter((receiver) => (
            receiver.position === 'admin' ||
            receiver.position === 'company_admin' ||
            (
              (receiver.position === 'branch_manager' &&
              receiver.branchId['_id'] === secureStorage.getItem('branchId'))
            ) ||
            (
              (receiver.position != 'admin' && receiver.position != 'company_admin' && receiver.position != 'branch_manager') &&
              receiver.branchId['_id'] === secureStorage.getItem('branchId')
            )
          ))];
        },
        (error) => {
          this.errorMsg = <any>error;

          this.notificationService.showErrorToast('Error in getting employee details. Please try again after some time.', 2000, 'top');
        }
      );
    }
  }

  selectChatReceiver(index: number): void {
    this.modalCtrl.dismiss({
      receiverEmployee: this.chatReceivers[index]
    })
  }
}
