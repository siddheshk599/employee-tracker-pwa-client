import { ActivatedRoute } from '@angular/router';
import { AttendanceDetailPage } from './../attendance-detail/attendance-detail.page';
import { EmployeeService } from './../services/employee/employee.service';
import Employee from '../shared/models/employee.model';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AttendanceService } from '../services/attendance/attendance.service';
import { NotificationService } from '../services/notification/notification.service';
import Attendance from '../shared/models/attendance.model';
import { secureStorage } from '../shared/storage';
import { AttendanceMapPage } from '../attendance-map/attendance-map.page';
import { constants } from '../shared/constants';
import { functions } from '../shared/functions';

@Component({
  selector: 'app-report',
  templateUrl: './report.page.html',
  styleUrls: ['./report.page.scss'],
})
export class ReportPage {

  employee: Employee;
  errorMsg: any;
  empIdAttendancesForMonth: Attendance[];
  storageEmpPosition: string;
  months: string[] = constants.months;

  attendanceMonths: {
    monthAndYear: string,
    startDate: string,
    endDate: string
  }[] = [];
  selectedAttendanceMonth: string;
  selectedMonthIndex: number;
  sharedFunctions = functions;

  calendarViewToggle: boolean = false;
  weekDays: string[] = constants.weekDays;
  offsetColCount: number;

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private notificationService: NotificationService,
    private title: Title,
    private activatedRoute: ActivatedRoute
  ) {}

  ionViewWillEnter(): void {
    this.title.setTitle(`Report - ${constants.appName}`);
    this.storageEmpPosition = secureStorage.getItem('position');
    this.offsetColCount = 0;
    this.selectedMonthIndex = 0;
    this.selectedAttendanceMonth = "- -";

    if (history.state['_id']) {
      this.employee = history.state;
      this.getReportByEmpId(this.employee._id);

    } else {
      this.getEmployeeDetailsByIdAndGetReport(this.activatedRoute.snapshot.paramMap.get('employeeId'));
    }
  }

  ionViewWillLeave(): void {
    this.errorMsg = undefined;
  }

  getDateAsSerialNumber(date: string): number {
    let dateObject = new Date(date);

    return dateObject.getDate();
  }

  getWorkHrs(date2: string, date1: string): string {
    let diffInMins = this.sharedFunctions.getDiffInMins(new Date(date2), new Date(date1));

    let floatDiffInHours = diffInMins / 60;
    let hoursCount = Math.floor(floatDiffInHours);
    let minutesCount = Math.round((floatDiffInHours - hoursCount) * 60);

    return `${hoursCount.toFixed(0).padStart(2, '0')}:${minutesCount.toFixed(0).padEnd(2, '0')}`
  }

  getEmployeeDetailsByIdAndGetReport(empId: string): void {
    this.employee = undefined;
    this.errorMsg = undefined;

    this.employeeService.getEmployeeDetailsById(empId).subscribe(
      (employee) => {
        this.employee = employee;
        this.getReportByEmpId(employee._id);
      },
      (error) => {
        this.errorMsg = <any>error;

        this.notificationService.showErrorToast(`Error in getting ${
          (secureStorage.getItem('position') === 'employee') ? "your" : "employee's"
        } details.`, 2000, 'top');
      }
    );
  }

  getReportByEmpId(empId: string): void {
    this.empIdAttendancesForMonth = undefined;
    this.errorMsg = undefined;

    this.attendanceService.getAttendanceMonthsByEmpId(empId)
    .subscribe(
      (attendanceMonths) => {
        this.attendanceMonths = [...attendanceMonths];
        this.selectedMonthIndex = 0;
        this.selectedAttendanceMonth = this.attendanceMonths[this.selectedMonthIndex].monthAndYear;

        this.getReportByEmpIdForPeriod(
          empId,
          this.attendanceMonths[0].startDate,
          this.attendanceMonths[0].endDate
        );
      },
      (error) => {
        this.errorMsg = <any>error;

        this.notificationService.showErrorToast('Error in generating your report. Kindly try again.', 2000, 'top');
      }
    );
  }

  getReportByEmpIdForPeriod(empId: string, startDate: string, endDate: string): void {
    this.empIdAttendancesForMonth = undefined;
    this.errorMsg = undefined;

    this.attendanceService.getAttendancesByEmpId(
      empId,
      `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&attendancePadding=true`
    ).subscribe(
      (attendances) => {
        this.empIdAttendancesForMonth = [];
        this.empIdAttendancesForMonth = [...attendances]

        this.changeView();
      },
      (error) => {
        this.errorMsg = <any>error;
        this.empIdAttendancesForMonth = [];

        this.notificationService.showErrorToast('Error in generating your report. Kindly try again.', 2000, 'top');
      }
    );
  }

  getWorkingHrs(inTime: string, outTime: string): string {
    let inTimeMs = new Date(inTime).getTime();
    let outTimeMs = new Date(outTime).getTime();

    let diffInMins = Math.round((outTimeMs - inTimeMs) / 1000 / 60);

    let hours = Math.floor(diffInMins);
    let minutes = Math.round((diffInMins - hours) * 60);

    return (hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0'));
  }

  showMap(index: number): void {
    let modal = this.notificationService.createModal(AttendanceMapPage, true, {
      attendance: this.empIdAttendancesForMonth[index]
    });

    modal.then((response) => response.present())
    .catch((error) => console.error('Error in opening attendance map modal:', error));
  }

  changeReportMonth(mode: 'forward' | 'backward' | 'selectOption'): void {
    if (mode === 'forward') {
      if (this.selectedMonthIndex != -1) {
        if (
          (this.selectedMonthIndex >= 0) &&
          (this.selectedMonthIndex < (this.attendanceMonths.length - 1))
        ) {
          ++this.selectedMonthIndex;

        } else if (this.selectedMonthIndex === (this.attendanceMonths.length - 1)) {
          this.selectedMonthIndex = ((this.selectedMonthIndex + 1) % this.attendanceMonths.length);
        }
      }

    } else if (mode === 'backward') {
      if (this.selectedMonthIndex != -1) {
        if (
          (this.selectedMonthIndex > 0) &&
          (this.selectedMonthIndex < this.attendanceMonths.length)
        ) {
          --this.selectedMonthIndex;

        } else if (this.selectedMonthIndex === 0) {
          this.selectedMonthIndex += this.attendanceMonths.length - 1;
        }
      }

    } else if (mode === 'selectOption') {
      this.selectedMonthIndex = this.attendanceMonths.map((elem) => elem.monthAndYear).indexOf(this.selectedAttendanceMonth);
    }

    if (this.attendanceMonths[this.selectedMonthIndex]) {
      this.selectedAttendanceMonth = this.attendanceMonths[this.selectedMonthIndex].monthAndYear;

      this.getReportByEmpIdForPeriod(
        this.activatedRoute.snapshot.paramMap.get('employeeId'),
        this.attendanceMonths[this.selectedMonthIndex].startDate,
        this.attendanceMonths[this.selectedMonthIndex].endDate
      );
    }
  }

  changeView(): void {
    if (this.calendarViewToggle && this.empIdAttendancesForMonth?.length > 0) {
      let reportDate = new Date(this.empIdAttendancesForMonth[0].inTime);

      reportDate.setUTCMinutes(reportDate.getUTCMinutes() - reportDate.getTimezoneOffset());

      let dayIndex = reportDate.getUTCDay();
      this.offsetColCount = dayIndex;
    }
  }

  viewAttendance(record: any): void {
    let modal = this.notificationService.createModal(AttendanceDetailPage, true, {
      empAttendances: [record],
      currentRecord: record,
      isEditMode: false
    });

    modal.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the attendance detail modal:', error));
  }

  viewLocationHistory(record: Attendance): void {
    let modal = this.notificationService.createModal(AttendanceMapPage, true, {
      attendance: record
    });

    modal.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the attendance map modal:', error));
  }

  getBgStyling(status: string): string {
    return `background: ${
      (status === 'on-time') ? '#2dd36f' : (
        (status === 'late') ? '#ffc409' : (
          (status === 'absent') ? '#ff4961' : (
            (status === 'holiday') ? '#6a64ff' : '#ff6f00'
          )
        )
      )
    };`;
  }

}
