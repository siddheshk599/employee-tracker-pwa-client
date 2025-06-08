import { functions } from './../shared/functions';
import { AttendanceService } from './../services/attendance/attendance.service';
import { SalaryAdvanceService } from './../services/salary-advance/salary-advance.service';
import { NotificationService } from './../services/notification/notification.service';
import { secureStorage } from './../shared/storage';
import Employee from '../shared/models/employee.model';
import { ModalController } from '@ionic/angular';
import { Component, Input } from '@angular/core';
import { SalarySlipPage } from '../salary-slip/salary-slip.page';

@Component({
  selector: 'app-statement',
  templateUrl: './statement.page.html',
  styleUrls: ['./statement.page.scss'],
})
export class StatementPage {

  @Input() employee: Employee;
  errorMsg;
  salaryMonths: {
    monthAndYear: string,
    startDate: string,
    endDate: string
  }[];
  selectedMonthIndex: number;
  selectedSalaryMonth: string;
  empSalaryMonthDetails: {
    salaryMonth: string,
    workingCount: number,
    paidLeavesCount: number,
    totalSalary: number,
    advanceTaken: number,
    netSalary: number
  };
  sharedFunctions = functions;

  constructor(
    private modalCtrl: ModalController,
    private notificationService: NotificationService,
    private salaryAdvService: SalaryAdvanceService,
    private attendanceService: AttendanceService
  ) {}

  ionViewWillEnter(): void {
    this.selectedMonthIndex = 0;
    this.selectedSalaryMonth = "- -";
    this.getSalaryMonthsOfEmployee();
  }

  dismissModal(): void {
    this.modalCtrl.dismiss();
  }

  getSalaryMonthsOfEmployee(): void {
    this.errorMsg = undefined;
    this.salaryMonths = undefined;

    this.attendanceService.getAttendanceMonthsByEmpId(this.employee._id)
    .subscribe(
      (attendanceMonths) => {
        this.salaryMonths = [];
        this.salaryMonths = [...attendanceMonths];
        this.selectedMonthIndex = 0;
        this.selectedSalaryMonth = this.salaryMonths[this.selectedMonthIndex].monthAndYear;

        this.getSalaryMonthDetails(
          this.salaryMonths[this.selectedMonthIndex].startDate,
          this.salaryMonths[this.selectedMonthIndex].endDate
        );
      },
      (error) => {
        this.errorMsg = <any>error;
        this.salaryMonths = [];

        this.notificationService.showErrorToast('Error in generating the statement of employee. Kindly try again.', 2000, 'top');
      }
    );
  }

  getDiffInHours(fromDate: Date, tillDate: Date): number {
    let diffInHours: number = Math.round(this.sharedFunctions.getDiffInMins(tillDate, fromDate) / 60);

    return diffInHours;
  }

  getSalaryMonthDetails(monthStartDate: string, monthEndDate: string): void {
    this.errorMsg = undefined;
    this.empSalaryMonthDetails = undefined;

    let empSalaryDetails = {
      salaryMonth: this.salaryMonths[this.selectedMonthIndex].monthAndYear,
      workingCount: 0,
      paidLeavesCount: 0,
      totalSalary: 0,
      advanceTaken: 0,
      netSalary: 0
    };

    this.attendanceService.getAttendancesByEmpId(
      this.employee._id,
      `?startDate=${encodeURIComponent(monthStartDate)}&endDate=${encodeURIComponent(monthEndDate)}&attendancePadding=false`
    ).subscribe(
      (attendances) => {

        attendances.forEach((attendance) => {
          if (attendance.status === 'paid_leave') {
            if (this.employee.salaryType === 'daily' || this.employee.salaryType === 'weekly') {
              ++empSalaryDetails.paidLeavesCount;

            } else if (this.employee.salaryType === 'hourly') {
              empSalaryDetails.paidLeavesCount += this.getDiffInHours(new Date(attendance.inTime), new Date(attendance.outTime));

            }
          } else if (attendance.status === 'on-time' || attendance.status === 'late') {
            if (this.employee.salaryType === 'daily' || this.employee.salaryType === 'weekly') {
              ++empSalaryDetails.workingCount;

            } else if (this.employee.salaryType === 'hourly') {
              empSalaryDetails.workingCount += this.getDiffInHours(new Date(attendance.inTime), new Date(attendance.outTime));

            }
          }
        });

        this.salaryAdvService.getSalaryAdvancesByEmpId(secureStorage.getItem('empId'), `?status=approved&startDate=${encodeURIComponent(monthStartDate)}&endDate=${encodeURIComponent(monthEndDate)}`)
        .subscribe(
          (salaryAdvances) => {
            salaryAdvances.forEach((salAdv) => {
              empSalaryDetails.advanceTaken += salAdv.advanceAmount;
            });

            if (this.employee.salaryType === 'weekly') {
              empSalaryDetails.workingCount = (empSalaryDetails.workingCount * 1.0) / this.employee.workingDays.length;

              empSalaryDetails.paidLeavesCount = (empSalaryDetails.paidLeavesCount * 1.0) / this.employee.workingDays.length;
            }

            empSalaryDetails.totalSalary = this.sharedFunctions.roundTo4Decimals(
              ((
                empSalaryDetails.workingCount +
                empSalaryDetails.paidLeavesCount
              ) * this.employee.salaryAmount)
            );

            empSalaryDetails.netSalary = this.sharedFunctions.roundTo4Decimals(
              (empSalaryDetails.totalSalary - empSalaryDetails.advanceTaken)
            );

            if (this.employee.salaryType === 'weekly') {
              empSalaryDetails.workingCount = this.sharedFunctions.roundTo4Decimals(
                (empSalaryDetails.workingCount * this.employee.workingDays.length)
              );

              empSalaryDetails.paidLeavesCount = this.sharedFunctions.roundTo4Decimals(
                (empSalaryDetails.paidLeavesCount * this.employee.workingDays.length)
              );
            }

            this.empSalaryMonthDetails = empSalaryDetails;
          },
          (error) => {
            this.errorMsg = <any>error;

            this.notificationService.showErrorToast('Error in getting your salary details. Please try again after some time.', 2000, 'top');
          }
        );
      },
      (error) => {
        this.errorMsg = <any>error;

        this.notificationService.showErrorToast('Error in getting your salary details. Please try again after some time.', 2000, 'top');
      }
    );
  }

  changeReportMonth(mode: 'forward' | 'backward' | 'selectOption'): void {
    if (mode === 'forward') {
      if (this.selectedMonthIndex != -1) {
        if (this.selectedMonthIndex >= 0 && this.selectedMonthIndex < (this.salaryMonths.length - 1)) {
          ++this.selectedMonthIndex;

        } else if (this.selectedMonthIndex === (this.salaryMonths.length - 1)) {
          this.selectedMonthIndex = (
            ++this.selectedMonthIndex % this.salaryMonths.length
          );

        }
      }

    } else if (mode === 'backward') {
      if (this.selectedMonthIndex != -1) {
        if (this.selectedMonthIndex > 0 && this.selectedMonthIndex < this.salaryMonths.length) {
          --this.selectedMonthIndex;

        } else if (this.selectedMonthIndex === 0) {
          this.selectedMonthIndex += this.salaryMonths.length - 1;

        }
      }

    } else if (mode === 'selectOption') {
      this.selectedMonthIndex = this.salaryMonths.map((elem) => elem.monthAndYear).indexOf(this.selectedSalaryMonth);
    }

    if (this.salaryMonths[this.selectedMonthIndex]) {
      this.selectedSalaryMonth = this.salaryMonths[this.selectedMonthIndex].monthAndYear;

      this.getSalaryMonthDetails(
        this.salaryMonths[this.selectedMonthIndex].startDate,
        this.salaryMonths[this.selectedMonthIndex].endDate
      );
    }

  }

  viewSalaryMonthSlip(employee: Employee, empSalaryMonthDetails: {}): void {
    let data = {
      employee: employee,
      empSalaryDetails: empSalaryMonthDetails
    };

    let modal = this.notificationService.createModal(SalarySlipPage, true, data);

    modal.then((response) => response.present())
    .catch((error) => console.error("Error in presenting the modal:", error));
  }

}
