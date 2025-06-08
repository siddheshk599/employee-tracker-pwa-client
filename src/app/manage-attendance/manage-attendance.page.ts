import Attendance from '../shared/models/attendance.model';
import { AttendanceDetailPage } from './../attendance-detail/attendance-detail.page';
import { functions } from './../shared/functions';
import { AttendanceService } from './../services/attendance/attendance.service';
import { Title } from '@angular/platform-browser';
import { BranchService } from './../services/branch/branch.service';
import { NotificationService } from './../services/notification/notification.service';
import CompanyBranch from '../shared/models/company-branch.model';
import { secureStorage } from './../shared/storage';
import { constants } from './../shared/constants';
import { Component } from '@angular/core';

@Component({
  selector: 'app-manage-attendance',
  templateUrl: './manage-attendance.page.html',
  styleUrls: ['./manage-attendance.page.scss'],
})
export class ManageAttendancePage {

  errorMsg;
  storageEmpPosition: string;
  attendancesForDate: Attendance[];
  attendanceDates: { startDate: string, endDate: string }[] = [];
  selectedDateIndex: number = 0;
  selectedAttendanceDate: string = "- -";
  empBranchDetails: CompanyBranch;
  sharedFunctions = functions;

  constructor(
    private notificationService: NotificationService,
    private branchService: BranchService,
    private attendanceService: AttendanceService,
    private title: Title
  ) {}

  ionViewWillEnter(): void {
    this.storageEmpPosition = secureStorage.getItem('position');
    this.title.setTitle(`Manage Attendance - ${constants.appName}`);
    this.selectedDateIndex = 0;
    this.selectedAttendanceDate = "- -";
    this.getAttendanceDates(this.storageEmpPosition);
  }

  ionViewWillLeave(): void {
    this.errorMsg = undefined;
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

        this.notificationService.showErrorToast('Error in getting your punch-in location details. Kindly try again.', 2000, 'top')
      }
    );
  }

  getAttendanceDates(empPosition: string): void {
    this.errorMsg = undefined;

    this.attendanceService.getAttendanceDatesOfAllEmpByQuery(`${
      (empPosition === 'admin') ? '?admin=true' : (
        (empPosition === 'company_admin') ? `?companyId=${secureStorage.getItem('companyId')}` : (
          (empPosition === 'branch_manager') ? `?branchId=${secureStorage.getItem('branchId')}`: ''
        )
      )
    }`).subscribe(
      (attendanceDates) => {
        this.attendanceDates = [];
        this.attendanceDates = [...attendanceDates];
        this.selectedDateIndex = 0;
        this.selectedAttendanceDate = this.attendanceDates[this.selectedDateIndex].startDate;

        this.getReportForPeriod(
          empPosition,
          this.attendanceDates[this.selectedDateIndex].startDate,
          this.attendanceDates[this.selectedDateIndex].endDate
        );
      },
      (error) => {
        this.errorMsg = <any>error;
        this.attendanceDates = [];

        this.notificationService.showErrorToast('Error in getting attendance record(s). Kindly try again.', 2000, 'top');
      }
    );
  }

  getReportForPeriod(empPosition: string, startDate: string, endDate: string): void {
    this.errorMsg = undefined;
    this.attendancesForDate = undefined;

    this.attendanceService.getAllAttendances(`${
      (empPosition === 'admin') ? '?admin=true' : (
        (empPosition === 'company_admin') ? `?companyId=${secureStorage.getItem('companyId')}` : (
          (empPosition === 'branch_manager') ? `?branchId=${secureStorage.getItem('branchId')}`: ''
        )
      )
    }&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`).subscribe(
      (attendances) => {
        this.attendancesForDate = [];
        this.attendancesForDate = [...attendances];
      },
      (error) => {
        this.errorMsg = <any>error;
        this.attendancesForDate = [];

        this.notificationService.showErrorToast('Error in getting attendance record(s). Kindly try again.', 2000, 'top');
      }
    );
  }

  changeReportDate(mode: 'forward' | 'backward' | 'selectOption', empPosition: string): void {
    if (mode === 'forward') {
      if (this.selectedDateIndex != -1) {
        if (
          (this.selectedDateIndex >= 0) &&
          (this.selectedDateIndex < (this.attendanceDates.length - 1))
        ) {
          ++this.selectedDateIndex;

        } else if (this.selectedDateIndex === (this.attendanceDates.length - 1)) {
          this.selectedDateIndex = ((this.selectedDateIndex + 1) % this.attendanceDates.length);
        }
      }

    } else if (mode === 'backward') {
      if (this.selectedDateIndex != -1) {
        if (
          (this.selectedDateIndex > 0) &&
          (this.selectedDateIndex < this.attendanceDates.length)
        ) {
          --this.selectedDateIndex;

        } else if (this.selectedDateIndex === 0) {
          this.selectedDateIndex += this.attendanceDates.length - 1;
        }
      }
    } else if (mode === 'selectOption') {
      this.selectedDateIndex = this.attendanceDates.map((elem) => elem.startDate).indexOf(this.selectedAttendanceDate);
    }

    if (this.attendanceDates[this.selectedDateIndex]) {
      this.selectedAttendanceDate = this.attendanceDates[this.selectedDateIndex].startDate;

      this.getReportForPeriod(
        empPosition,
        this.attendanceDates[this.selectedDateIndex].startDate,
        this.attendanceDates[this.selectedDateIndex].endDate
      );
    }
  }

  editEmployeeAttendanceDetails(index: number): void {
    let empAttendances = [this.attendancesForDate[index]];

    let modal = this.notificationService.createModal(AttendanceDetailPage, true, {
      empAttendances: empAttendances,
      currentRecord: this.attendancesForDate[index],
      isEditMode: true
    });

    modal.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the attendance detail modal:', error));

    modal.then((response) => {
      response.onDidDismiss()
      .then((response) => {
        this.ionViewWillEnter();
      })
      .catch((error) => console.error("Unable to get the data from modal dismiss:", error));
    })
    .catch((error) => console.error('Error in handling the modal:', error));
  }

}
