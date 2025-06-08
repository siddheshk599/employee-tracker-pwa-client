import { AnalyticsService } from './../services/analytics/analytics.service';
import { functions } from './../shared/functions';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Title, SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AuthService } from '../services/auth/auth.service';
import { EmployeeService } from '../services/employee/employee.service';
import { LocationService } from '../services/location/location.service';
import { NotificationService } from '../services/notification/notification.service';
import { constants } from '../shared/constants';
import Employee from '../shared/models/employee.model';
import { secureStorage } from '../shared/storage';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  branchLocation: {
    latitude: number,
    longitude: number
  } = {
    latitude: 0.0000,
    longitude: 0.0000
  };
  errorMsg;
  employee: Employee;
  employees: Employee[];

  segmentButton: string;
  employeeAttendanceByBranchManager: boolean;
  gpsCheckInterval;
  canPunchInOut: boolean;

  canApplyForLeave: boolean;
  sharedFunctions = functions;
  analytics: {};
  googleMapsURL: SafeResourceUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(constants.indiaMapURL);

  constructor(
    private router: Router,
    private domSanitizer: DomSanitizer,
    private authService: AuthService,
    private employeeService: EmployeeService,
    private notificationService: NotificationService,
    private title: Title,
    private locationService: LocationService,
    private analyticsService: AnalyticsService,
    private platform: Platform
  ) {}

  ngOnInit(): void {
    this.googleMapsURL = this.domSanitizer.bypassSecurityTrustResourceUrl(constants.indiaMapURL);
  }

  ionViewWillEnter(): void {
    this.title.setTitle(`Home - ${constants.appName}`);
    this.employee = undefined;
    this.canPunchInOut = false;
    this.canApplyForLeave = false;
    this.employeeAttendanceByBranchManager = false;
    this.segmentButton = 'yourJob';
    this.authService.checkJwtToken();

    if (history.state['_id']) {
      this.employee = history.state;
      this.employeeConfig(this.employee);
    } else {
      this.getEmployeeDetailsById();
    }
  }

  ionViewWillLeave(): void {
    this.errorMsg = undefined;
    this.segmentButton = 'yourJob';
    this.employeeAttendanceByBranchManager = false;
  }

  segmentChange(event) {
    if (event.target.value === 'employeeJob' && this.employee.position === 'branch_manager') {
      this.errorMsg = undefined;

      this.employeeService.getEmployeesByBranchId(this.employee.branchId['_id'], '?isActive=true&hasApproval=true').subscribe(
        (employees) => {
          this.employees = employees.filter((employee) => (
            employee._id != this.employee._id &&
            employee.position != 'admin' &&
            employee.position != 'company_admin' &&
            employee.position != 'branch_manager' &&
            this.employeeService.canMarkAttendance(employee)
          ));
        },
        (error) => {
          this.errorMsg = <any>error;

          this.notificationService.showErrorToast("Error in getting details of your branch's employees.", 2000, 'top');
        }
      );
    }
  }

  navigateTo(path: string, employee: Employee) {
    this.router.navigateByUrl(`${path}/${employee._id}`, {
      state: employee
    });
  }

  openEmployeeJob(index: number): void {
    this.employee = this.employees[index];
    this.employeeAttendanceByBranchManager = true;
    this.employeeConfig(this.employee);
  }

  employeeConfig(employee: Employee): void {
    if (employee.position != 'admin' && employee.position != 'company_admin') {
      this.canPunchInOut = this.employeeService.canMarkAttendance(this.employee);
      this.canApplyForLeave = this.employeeService.canApplyForLeave(this.employee);

      this.branchLocation = this.employee.branchId['branchLocation'];

      this.googleMapsURL = this.locationService.getGoogleMapsURLForCoordinates(
        constants.googleMapsQueryURL,
        this.branchLocation
      );

      if (employee.activeAttendanceId) {
        if (secureStorage.getItem('attendanceId') === null && this.employee.activeAttendanceId['_id']) {
          secureStorage.setItem('attendanceId', this.employee.activeAttendanceId['_id']);
        }

        if (!this.gpsCheckInterval) {
          this.gpsCheckInterval = this.locationService.setLocationTrackingInterval();

          this.locationService.addIntervalId(this.gpsCheckInterval);

          if (this.platform.is('android')) {
            this.locationService.startBgGpsMode();
          }
        }
      }
    } else {
      this.getAnalytics(employee._id);
    }
  }

  getEmployeeDetailsById(): void {
    this.employee = undefined;
    this.errorMsg = undefined;

    this.employeeService.getEmployeeDetailsById(secureStorage.getItem('empId')).subscribe(
      (employee) => {
        this.employee = employee;
        this.employeeConfig(this.employee);
      },
      (error) => {
        this.errorMsg = <any>error;

        this.notificationService.showErrorToast("Error in getting your details.", 2000, 'top');
      }
    );
  }

  getAnalytics(empId: string): void {
    this.analyticsService.getAnalytics(empId).subscribe(
      (analytics) => {
        this.analytics = analytics;
      },
      (error) => {
        this.errorMsg = <any>error;

        this.notificationService.showErrorToast('Error in getting company and employee details.', 2000, 'top');
      }
    );
  }

}
