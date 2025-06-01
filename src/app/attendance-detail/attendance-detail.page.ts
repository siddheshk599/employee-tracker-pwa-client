import Attendance from '../shared/models/attendance.model';
import { AttendanceService } from './../services/attendance/attendance.service';
import { NotificationService } from './../services/notification/notification.service';
import { BranchService } from './../services/branch/branch.service';
import { ModalController, AlertController } from '@ionic/angular';
import CompanyBranch from '../shared/models/company-branch.model';
import { secureStorage } from './../shared/storage';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-attendance-detail',
  templateUrl: './attendance-detail.page.html',
  styleUrls: ['./attendance-detail.page.scss'],
})
export class AttendanceDetailPage {

  @Input() empAttendances: Attendance[];
  @Input() currentRecord: Attendance;
  @Input() isEditMode: boolean;
  empBranchDetails: CompanyBranch;
  errorMsg;
  storageEmpPosition: string;
  currentStatus: string;
  attendanceStatuses: string[] = ['present', 'absent', 'paid_leave', 'unpaid_leave'];

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private branchService: BranchService,
    private attendanceService: AttendanceService,
    private notificationService: NotificationService
  ) {}

  ionViewWillEnter(): void {
    this.storageEmpPosition = secureStorage.getItem('position');

    if (!this.isEditMode) {
      this.getBranchDetailsById(secureStorage.getItem('branchId'));
    } else {
      this.currentStatus = (this.currentRecord.status === 'on-time' || this.currentRecord.status === 'late') ? 'present' : this.currentRecord.status;
    }

  }

  dismissModal(): void {
    this.modalCtrl.dismiss();
  }

  getBranchDetailsById(branchId: string): void {
    this.empBranchDetails = undefined;
    this.errorMsg = undefined;

    this.branchService.getBranchDetailsById(branchId).subscribe(
      (branch) => {
        this.empBranchDetails = branch;
      },
      (error) => {
        this.errorMsg = <any>error;

        this.notificationService.showErrorToast(`Error in getting ${
          (this.storageEmpPosition === 'employee') ? 'your' : "employee's"
        } punch-in location details. Kindly try again.`, 2000, 'top')
      }
    );
  }

  changeReportDate(direction: string): void {
    let currentIdx = this.empAttendances.indexOf(this.currentRecord);

    if (direction === 'forward') {
      if (currentIdx != -1) {
        if (currentIdx >= 0 && currentIdx < (this.empAttendances.length - 1)) {
          this.currentRecord = this.empAttendances[++currentIdx];

        } else if (currentIdx === (this.empAttendances.length - 1)) {
          this.currentRecord = this.empAttendances[(
            ++currentIdx % this.empAttendances.length
          )];

        }
      }

    } else if (direction === 'backward') {
      if (currentIdx != -1) {
        if (currentIdx > 0 && currentIdx < this.empAttendances.length) {
          this.currentRecord = this.empAttendances[--currentIdx];

        } else if (currentIdx === 0) {
          currentIdx += this.empAttendances.length - 1;
          this.currentRecord = this.empAttendances[currentIdx];

        }
      }
    }

    this.currentStatus = (this.currentRecord.status === 'on-time' || this.currentRecord.status === 'late') ? 'present' : this.currentRecord.status;
  }

  statusUpdateConfirmation(): void {
    if (this.currentRecord.status != this.currentStatus) {
      let alert = this.alertCtrl.create({
        header: 'Update status?',
        message: `Update the status of this record to '${this.currentStatus}'?`,
        cssClass: 'custom-font',
        buttons: [
          {
            text: 'NO',
            role: 'cancel'
          },
          {
            text: 'YES',
            handler: () => this.changeStatus(this.currentRecord.status, this.currentStatus)
          }
        ]
      });

      alert.then(
        (response) => response.present(),
        (error) => console.error("Error in presenting the alert:", error)
      );
    } else {
      this.notificationService.showErrorToast('Please select a different attendance status to update.', 2000, 'top');
    }
  }

  changeStatus(oldStatus: string, newStatus: string): void {
    let updatedAttendance = {};
    oldStatus = (oldStatus === 'on-time' || oldStatus === 'late') ? 'present' : oldStatus;

    if (oldStatus === 'present') {
      if (newStatus === 'absent') {
        this.deleteAttendanceById(this.currentRecord._id, oldStatus, newStatus);

      } else if (newStatus === 'paid_leave' || newStatus === 'unpaid_leave') {
        updatedAttendance = {
          punchInImg: '',
          punchOutImg: '',
          punchInDoneBy: secureStorage.getItem('empId'),
          punchOutDoneBy: secureStorage.getItem('empId'),
          status: newStatus,
          locationHistory: [],
        };

        this.updateAttendanceById(this.currentRecord._id, updatedAttendance, oldStatus, newStatus);
      }

    } else if (oldStatus === 'absent') {
      if (newStatus === 'present') {
        updatedAttendance = {
          empId: this.currentRecord.empId['_id'],
          inTime: this.currentRecord.inTime,
          outTime: this.currentRecord.outTime,
          punchInImg: this.currentRecord.empId['photoImg'],
          punchOutImg: this.currentRecord.empId['photoImg'],
          punchInLocation: this.currentRecord.punchInLocation,
          punchOutLocation: this.currentRecord.punchOutLocation,
          punchInDoneBy: secureStorage.getItem('empId'),
          punchOutDoneBy: secureStorage.getItem('empId'),
          status: 'on-time',
          locationHistory: []
        };

        this.addAttendance(updatedAttendance, oldStatus, newStatus);

      } else if (newStatus === 'paid_leave' || newStatus === 'unpaid_leave') {
        updatedAttendance = {
          empId: this.currentRecord.empId['_id'],
          inTime: this.currentRecord.inTime,
          outTime: this.currentRecord.outTime,
          punchInImg: '',
          punchOutImg: '',
          punchInLocation: this.currentRecord.punchInLocation,
          punchOutLocation: this.currentRecord.punchOutLocation,
          punchInDoneBy: secureStorage.getItem('empId'),
          punchOutDoneBy: secureStorage.getItem('empId'),
          status: newStatus,
          locationHistory: []
        };

        this.addAttendance(updatedAttendance, oldStatus, newStatus);
      }

    } else if (oldStatus === 'paid_leave' || oldStatus === 'unpaid_leave') {

      if (newStatus === 'present') {
        updatedAttendance = {
          punchInDoneBy: secureStorage.getItem('empId'),
          punchOutDoneBy: secureStorage.getItem('empId'),
          status: 'on-time',
          locationHistory: []
        };

        this.updateAttendanceById(this.currentRecord._id, updatedAttendance, oldStatus, newStatus);

      } else if (newStatus === 'absent') {
        this.deleteAttendanceById(this.currentRecord._id, oldStatus, newStatus);

      } else if ((newStatus === 'paid_leave' || newStatus === 'unpaid_leave') && (oldStatus != newStatus)) {
        updatedAttendance = {
          status: newStatus
        };

        this.updateAttendanceById(this.currentRecord._id, updatedAttendance, oldStatus, newStatus);
      }
    }
  }

  replaceWithNewAttendance(attendance: any): void {
    this.currentRecord = attendance;

    let currentRecordIndex = this.empAttendances.indexOf(this.currentRecord);
    this.empAttendances[currentRecordIndex] = attendance;
  }

  addAttendance(attendance: any, oldStatus: string, newStatus: string): void {
    this.errorMsg = undefined;

    let loader = this.notificationService.createLoader(`Updating ths status to ${newStatus}...`);
    loader.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the loader:', error));

    this.attendanceService.addAttendance(attendance).subscribe(
      (attendance) => {
        this.replaceWithNewAttendance(attendance);

        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showToast(`Attendance record status updated from '${oldStatus}' to '${newStatus}' successfully. `, 2000, 'top');

        this.modalCtrl.dismiss();
      },
      (error) => {
        this.errorMsg = <any>error;

        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showErrorToast(`Error in changing the attendance record's status from '${oldStatus}' to '${newStatus}'.`, 2000, 'top');

        this.modalCtrl.dismiss();
      }
    );
  }

  updateAttendanceById(attendanceId: string, updateData: any, oldStatus: string, newStatus: string): void {
    this.errorMsg = undefined;

    let loader = this.notificationService.createLoader(`Updating ths status to ${newStatus}...`);
    loader.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the loader:', error));

    this.attendanceService.updateAttendanceById(attendanceId, updateData)
    .subscribe(
      (updatedAttendance) => {
        this.replaceWithNewAttendance(updatedAttendance);

        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showToast(`Attendance record status updated from '${oldStatus}' to '${newStatus}' successfully. `, 2000, 'top');

        this.modalCtrl.dismiss();
      },
      (error) => {
        this.errorMsg = <any>error;

        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showErrorToast(`Error in changing the attendance record's status from '${oldStatus}' to '${newStatus}'.`, 2000, 'top');

        this.modalCtrl.dismiss();
      }
    );
  }

  deleteAttendanceById(attendanceId: string, oldStatus: string, newStatus: string): void {
    this.errorMsg = undefined;

    let loader = this.notificationService.createLoader(`Updating ths status to ${newStatus}...`);
    loader.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the loader:', error));

    this.attendanceService.deleteAttendanceById(attendanceId).subscribe(
      (attendance) => {
        this.currentRecord.status = 'absent';

        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showToast(`Attendance record status updated from '${oldStatus}' to '${newStatus}' successfully. `, 2000, 'top');

        this.modalCtrl.dismiss();
      },
      (error) => {
        this.errorMsg = <any>error;

        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showErrorToast(`Error in changing the attendance record's status from '${oldStatus}' to '${newStatus}'.`, 2000, 'top');

        this.modalCtrl.dismiss();
      }
    );
  }
}
