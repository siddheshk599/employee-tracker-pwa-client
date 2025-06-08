import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SalarySlipPage } from '../salary-slip/salary-slip.page';
import { ChatService } from '../services/chat/chat.service';
import { EmployeeService } from '../services/employee/employee.service';
import { NotificationService } from '../services/notification/notification.service';
import { constants } from '../shared/constants';
import { formErrors, validationMessages } from '../shared/formValidation';
import { functions } from '../shared/functions';
import Attendance from '../shared/models/attendance.model';
import Chat from '../shared/models/chat.model';
import Employee from '../shared/models/employee.model';
import Leave from '../shared/models/leave.model';
import SalaryAdvance from '../shared/models/salary-advance.model';
import { secureStorage } from '../shared/storage';
import { AttendanceService } from './../services/attendance/attendance.service';
import { AuthService } from './../services/auth/auth.service';
import { LeaveService } from './../services/leave/leave.service';
import { SalaryAdvanceService } from './../services/salary-advance/salary-advance.service';
import { StatementPage } from './../statement/statement.page';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  mainSegmentButton: string;
  approvalSegmentButton: string;
  storageEmpPosition: string;
  employee: Employee;
  unApprovedEmployees: Employee[];
  unApprovedLeaves: Leave[];
  unApprovedSalaryAdvances: SalaryAdvance[];
  errorMsg;
  updateProfileForm: FormGroup;
  salaryAdvanceRequestForm: FormGroup;
  maxDob: number = new Date().getFullYear() - 18;
  empWorkingDays: string = "";
  formErrors = formErrors;
  validationMessages = validationMessages;
  minAdvanceDate: string;
  empSalaryDetails: {
    salaryMonth: string,
    workingCount: number,
    paidLeavesCount: number,
    totalSalary: number,
    advanceTaken: number,
    netSalary: number
  };
  sharedFunctions = functions;

  workingDays: string[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private attendanceService: AttendanceService,
    private chatService: ChatService,
    private salaryAdvService: SalaryAdvanceService,
    private employeeService: EmployeeService,
    private leaveService: LeaveService,
    private title: Title,
    private formBuilder: FormBuilder,
    private router: Router,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.createForm();
  }

  ionViewWillEnter(): void {
    this.title.setTitle(`Settings - ${constants.appName}`);
    this.mainSegmentButton = "profile",
    this.approvalSegmentButton = "leaveApproval",
    this.storageEmpPosition = secureStorage.getItem('position');
    this.getEmployeeDetailsById();
  }

  ionViewWillLeave(): void {
    this.errorMsg = undefined;
  }

  createForm(): void {
    this.updateProfileForm = this.formBuilder.group({
      workingDays: [[''], [Validators.required, Validators.min(1), Validators.max(7)]],

      emailId: ['', [Validators.email, Validators.minLength(6)]],

      dob: [''],

      address: ['', [Validators.minLength(20), Validators.maxLength(100), Validators.pattern(/[A-Za-z]+[0-9\.\,\/\s]*/g)]],

      bankAccNo: ['', [Validators.minLength(10), Validators.maxLength(20), Validators.pattern("^[0-9]+$")]],

      bankIfsc: ['', [Validators.minLength(11), Validators.maxLength(11), Validators.pattern("^[A-Z]{4}[A-Z0-9]{7}$")]],

      aadhaar: ['', [Validators.minLength(12), Validators.maxLength(12), Validators.pattern(/^[0-9]{12}$/g)]],

      pan: ['', [Validators.minLength(10), Validators.maxLength(10), Validators.pattern("^[A-Z]{5}[0-9]{4}[A-Z]{1}$")]]
    });

    this.updateProfileForm.valueChanges
    .subscribe((data) => {
      this.onUpdateProfileFormValueChanged(data);
    });

    this.onUpdateProfileFormValueChanged();

    this.salaryAdvanceRequestForm = this.formBuilder.group({
      advanceAmount: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4), Validators.min(100), Validators.max(9999)]],

      advanceDate: ['', Validators.required],

      reason: ['', Validators.required],

      status: ['in-process']
    });

    this.salaryAdvanceRequestForm.valueChanges
    .subscribe((data) => {
      this.onSalaryAdvanceRequestFormChanged(data);
    });

    this.onSalaryAdvanceRequestFormChanged();
  }

  onUpdateProfileFormValueChanged(data?: any): void {
    if (!this.updateProfileForm) {
      return;
    } else {
      const FORM = this.updateProfileForm;
      for (const FIELD in this.formErrors) {
        if (this.formErrors.hasOwnProperty(FIELD)) {
          this.formErrors[FIELD] = '';
          const CONTROL = FORM.get(FIELD);
          if (CONTROL && CONTROL.dirty && !CONTROL.valid) {
            const MESSAGES = this.validationMessages[FIELD];
            for (const KEY in CONTROL.errors) {
              if (CONTROL.errors.hasOwnProperty(KEY)) {
                this.formErrors[FIELD] += MESSAGES[KEY] + ' ';
              }
            }
          }
        }
      }
    }
  }

  onSalaryAdvanceRequestFormChanged(data?: any): void {
    if (!this.salaryAdvanceRequestForm) {
      return;
    } else {
      const FORM = this.salaryAdvanceRequestForm;
      for (const FIELD in this.formErrors) {
        if (this.formErrors.hasOwnProperty(FIELD)) {
          this.formErrors[FIELD] = '';
          const CONTROL = FORM.get(FIELD);
          if (CONTROL && CONTROL.dirty && !CONTROL.valid) {
            const MESSAGES = this.validationMessages[FIELD];
            for (const KEY in CONTROL.errors) {
              if (CONTROL.errors.hasOwnProperty(KEY)) {
                this.formErrors[FIELD] += MESSAGES[KEY] + ' ';
              }
            }
          }
        }
      }
    }
  }

  logOut() {
    let alert = this.notificationService.createAlert(
      'Confirm logout',
      'Do you really want to logout?',
      [
        {
          text: 'NO',
          role: 'cancel'
        },
        {
          text: 'YES',
          handler: () => this.authService.logOut()
        }
      ]
    );

    alert.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the alert:', error));
  }

  deleteAccount(): void {
    let alert = this.notificationService.createAlert(
      'Confirm account deletion',
      'All the data associated with your account will also be deleted. This action cannot be undone. Do you really want to delete your account?',
      [
        {
          text: 'NO',
          role: 'cancel'
        },
        {
          text: 'YES',
          handler: () => {
            let loader = this.notificationService.createLoader(`Deleting your account...`);

            loader.then((response) => response.present())
            .catch((error) => console.error('Error in presenting the loader:', error));

            this.employeeService.getEmployeesByCompanyId(secureStorage.getItem('companyId'), '?isActive=true&hasApproval=true&position=company_admin').subscribe(
              (companyAdmins) => {
                if (companyAdmins.length > 1) {
                  this.employeeService.deleteEmployeeDetailsById(this.employee._id).subscribe(
                    (employee) => {
                      loader.then((response) => response.dismiss())
                      .catch((error) => console.error('Error in dismissing the loader:', error));

                      this.notificationService.showToast(`Your account has been deleted successfully. Logging you out.`, 2000, 'top');

                      this.authService.logOut();
                    },
                    (error) => {
                      this.errorMsg = <any>error;

                      loader.then((response) => response.dismiss())
                      .catch((error) => console.error('Error in dismissing the loader:', error));

                      this.notificationService.showErrorToast(`Error in deleting the deleting your account. Kindly try again.`, 2000, 'top');
                    }
                  );

                } else {
                  loader.then((response) => response.dismiss())
                  .catch((error) => console.error('Error in dismissing the loader:', error));

                  this.notificationService.showErrorToast('Your company has only 1 Company Admin account. Please add another Company Admin account and then you can delete this account.', 2000, 'top');
                }
              },
              (error) => {
                this.errorMsg = <any>error;

                loader.then((response) => response.dismiss())
                .catch((error) => console.error('Error in dismissing the loader:', error));

                this.notificationService.showErrorToast(`Error in deleting the deleting your account. Kindly try again.`, 2000, 'top');
              }
            );
          }
        }
      ]
    );

    alert.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the alert:', error));
  }

  segmentChange(event: any) {
    if (event.target.value === 'salary') {
      this.minAdvanceDate = new Date().toISOString();
      this.getEmployeeSalaryDetails();

    } else if (event.target.value === 'profile') {
      this.getEmployeeDetailsById();

    } else if (event.target.value === 'approvals') {
      this.approvalSegmentButton = 'leaveApproval';
      this.getUnapprovedLeaves();

    } else if (event.target.value === 'employeeApproval') {
      this.getUnapprovedEmployees();

    } else if (event.target.value === 'leaveApproval') {
      this.getUnapprovedLeaves();

    } else if (event.target.value === 'salaryAdvanceApproval') {
      this.getUnapprovedSalaryAdvances();
    }
  }

  getEmployeeSalaryDetails(): void {
    this.errorMsg = undefined;
    this.empSalaryDetails = undefined;

    let currentDate = new Date();
    let firstDateOfMonth = new Date();

    firstDateOfMonth.setUTCDate(1);
    firstDateOfMonth.setUTCHours(0);
    firstDateOfMonth.setUTCMinutes(0);
    firstDateOfMonth.setUTCSeconds(0);
    firstDateOfMonth.setUTCMilliseconds(0);

    let lastDateOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23, 59, 59, 0
    );

    lastDateOfMonth.setUTCMinutes(lastDateOfMonth.getUTCMinutes() - lastDateOfMonth.getTimezoneOffset());

    let empSalaryDetails = {
      salaryMonth: constants.months[currentDate.getUTCMonth()].toUpperCase() + ' ' + currentDate.getUTCFullYear().toString(),
      workingCount: 0,
      paidLeavesCount: 0,
      totalSalary: 0,
      advanceTaken: 0,
      netSalary: 0
    };

    this.attendanceService.getAttendancesByEmpId(
      this.employee._id,
      `?startDate=${encodeURIComponent(firstDateOfMonth.toISOString())}&endDate=${encodeURIComponent(lastDateOfMonth.toISOString())}&attendancePadding=false`
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

        this.salaryAdvService.getSalaryAdvancesByEmpId(secureStorage.getItem('empId'), `?status=approved&startDate=${encodeURIComponent(firstDateOfMonth.toISOString())}&endDate=${encodeURIComponent(lastDateOfMonth.toISOString())}`)
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

            this.empSalaryDetails = empSalaryDetails;
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

  getDiffInHours(fromDate: Date, tillDate: Date): number {
    let diffInHours: number = Math.round(functions.getDiffInMins(tillDate, fromDate) / 60);

    return diffInHours;
  }

  getEmployeeDetailsById(): void {
    this.employee = undefined;
    this.errorMsg = undefined;

    this.employeeService.getEmployeeDetailsById(secureStorage.getItem('empId')).subscribe(
      (employee) => {
        this.employee = employee;

        if (this.storageEmpPosition === 'employee') {
          this.empWorkingDays = "",

          employee.workingDays.forEach((day) => {
            day = day[0].toUpperCase() + day.slice(1, day.length);
            this.empWorkingDays += day + ', ';
          });
        }

        this.updateProfileForm.patchValue({
          workingDays: employee.workingDays,
          emailId: employee.emailId,
          dob: employee.dob,
          address: employee.address,
          bankAccNo: employee.bankAccNo,
          bankIfsc: employee.bankIfsc,
          aadhaar: employee.aadhaar,
          pan: employee.pan
        });
      },
      (error) => {
        this.errorMsg = <any>error;

        this.notificationService.showErrorToast('Error in getting your details.', 2000, 'top');
      }
    );
  }

  getUnapprovedEmployees(): void {
    this.unApprovedEmployees = undefined;
    this.errorMsg = undefined;

    if (this.storageEmpPosition === 'admin') {
      this.employeeService.getAllEmployeeDetails('?hasApproval=false')
      .subscribe(
        (employees) => {
          this.unApprovedEmployees = [...employees];
        },
        (error) => {
          this.errorMsg = <any>error;

          this.notificationService.showErrorToast('Error in getting the details of unapproved employees.', 2000, 'top');
        }
      );

    } else if (this.storageEmpPosition ===  'company_admin') {
      this.employeeService.getEmployeesByCompanyId(secureStorage.getItem('companyId'), '?hasApproval=false').subscribe(
        (employees) => {
          this.unApprovedEmployees = [...employees];
        },
        (error) => {
          this.errorMsg = <any>error;

          this.notificationService.showErrorToast('Error in getting the details of unapproved employees.', 2000, 'top');
        }
      );
    }
  }

  getUnapprovedLeaves(): void {
    this.unApprovedLeaves = undefined;
    this.errorMsg = undefined;

    this.leaveService.getAllLeaveDetails('?status=in-process').subscribe(
      (leaves) => {
        leaves = [...leaves.filter((leave) => {
          let leaveFromDate = new Date(leave.fromDate);
          let currentDate = new Date();

          if (leaveFromDate.getTime() >= currentDate.getTime())
            return true;
        })];

        this.unApprovedLeaves = [...leaves];

        if (this.storageEmpPosition === 'company_admin') {
          this.unApprovedLeaves = [...leaves.filter((leave) => leave.empId['companyId']['_id'] === secureStorage.getItem('companyId') && leave.empId['position'] != 'admin' && leave.empId['position'] != 'company_admin')];

        } else if (this.storageEmpPosition === 'branch_manager') {
          this.unApprovedLeaves = [...leaves.filter((leave) => leave.empId['branchId']['_id'] === secureStorage.getItem('branchId') && leave.empId['position'] != 'admin' && leave.empId['position'] != 'company_admin' && leave.empId['position'] != 'branch_manager')];
        }
      },
      (error) => {
        this.errorMsg = <any>error;

        this.notificationService.showErrorToast('Error in getting the details of unapproved leaves.', 2000, 'top');
      }
    );
  }

  getUnapprovedSalaryAdvances(): void {
    this.unApprovedSalaryAdvances = undefined;
    this.errorMsg = undefined;

    this.salaryAdvService.getSalaryAdvances('?status=in-process')
    .subscribe(
      (salaryAdvances) => {
        salaryAdvances = [...salaryAdvances.filter((salaryAdvance) => {
          let advanceDate = new Date(salaryAdvance.advanceDate);
          let currentDate = new Date();

          if (advanceDate.getTime() >= currentDate.getTime())
            return true;
        })];

        this.unApprovedSalaryAdvances = [...salaryAdvances];

        if (this.storageEmpPosition === 'company_admin') {
          this.unApprovedSalaryAdvances = [...salaryAdvances.filter((leave) => leave.empId['companyId']['_id'] === secureStorage.getItem('companyId') && leave.empId['position'] != 'admin' && leave.empId['position'] != 'company_admin')];

        } else if (this.storageEmpPosition === 'branch_manager') {
          this.unApprovedSalaryAdvances = [...salaryAdvances.filter((advance) => advance.empId['branchId']['_id'] === secureStorage.getItem('branchId') && advance.empId['position'] != 'admin' && advance.empId['position'] != 'company_admin' && advance.empId['position'] != 'branch_manager')];
        }
      },
      (error) => {
        this.errorMsg = <any>error;

        this.notificationService.showErrorToast('Error in getting the details of unapproved salary advance requests.', 2000, 'top');
      }
    );
  }

  // Employee Profile update process
  updateProfile(): void {
    this.errorMsg = undefined;

    let updateProfileFormValue = this.updateProfileForm.value;
    let changes = {};

    if (this.storageEmpPosition === 'employee')
      delete updateProfileFormValue['workingDays'];

    Object.keys(this.updateProfileForm.controls).forEach((controlName) => {
      let formControl = this.updateProfileForm.controls[controlName];

      if (formControl.dirty) {
        changes[controlName] = formControl.value;
      }
    });

    if (Object.keys(changes).length === 0) {
      this.notificationService.showErrorToast("Since you've not made any changes to your profile, it won't get updated.", 2000, 'top');
    } else {
      let loader = this.notificationService.createLoader('Updating your profile...');
      loader.then((response) => response.present())
      .catch((error) => console.error('Error in presenting the loader:', error));

      this.employeeService.updateEmployeeDetailsById(secureStorage.getItem('empId'), changes).subscribe(
        (employee) => {
          loader.then((response) => response.dismiss())
          .catch((error) => console.error('Error in dismissing the loader:', error));

          this.employee = employee;

          this.notificationService.showToast('Your profile has been updated successfully.', 2000, 'top');
        },
        (error) => {
          this.errorMsg = <any>error;

          loader.then((response) => response.dismiss())
          .catch((error) => console.error('Error in dismissing the loader:', error));

          this.notificationService.showErrorToast('Error in updating your profile.', 2000, 'top');
        }
      );
    }
  }

  // Employee Profile approval or rejection
  sendEmployeeProfile(index: number): void {
    this.router.navigateByUrl(`/tabs/edit-employee/${this.unApprovedEmployees[index]._id}`, {
      state: this.unApprovedEmployees[index]
    });
  }

  // Leave Request Approval or Rejection
  getLeaveApprovalConfirmation(index: number): void {
    let leave: Leave = this.unApprovedLeaves[index];
    let alertMsg = 'Do you want to approve ' + leave.leaveType + ' leave of ' + leave.empId['empName'] + ' from ' + this.datePipe.transform(leave.fromDate, 'MMM d, y') + ' to ' + this.datePipe.transform(leave.tillDate, 'MMM d, y') + '?';

    let alert = this.notificationService.createAlert(
      'Approve leave?',
      alertMsg,
      [
        {
          text: 'Reject',
          handler: () => this.rejectLeave(leave)
        },
        {
          text: 'Approve',
          handler: () => this.approveLeave(leave)
        }
      ]
    );

    alert.then(
      (response) => response.present(),
      (error) => console.error("Error in presenting the alert:", error)
    );
  }

  approveLeave(leave: Leave): void {
    this.errorMsg = undefined;

    let employee: Employee = <Employee>leave.empId;
    let fromDate = new Date(leave.fromDate);
    let tillDate = new Date(leave.tillDate);

    if (employee.activeAttendanceId) {
      let leaveFromDate = leave.fromDate.split('T')[0];
      let attendanceInTime = employee.activeAttendanceId['inTime'].split('T')[0];

      if (leaveFromDate === attendanceInTime) {
        let inTime = new Date(employee.activeAttendanceId['inTime'].split('T')[0] + 'T' + employee.inTime.split('T')[1]);
        let outTime = new Date(employee.activeAttendanceId['inTime'].split('T')[0] + 'T' + employee.outTime.split('T')[1]);

        let punchOutAttendance = {
          inTime: inTime.toISOString(),
          outTime: outTime.toISOString(),
          punchOutImg: employee.activeAttendanceId['punchInImg'],
          punchOutLocation: employee.activeAttendanceId['punchInLocation'],
          punchOutDoneBy: secureStorage.getItem('empId'),
          status: (
            (leave.leaveType === 'paid') ? 'paid_leave' : 'unpaid_leave'
          ),
        };

        let loader = this.notificationService.createLoader('Updating active attendance details...');
        loader.then((response) => response.present())
        .catch((error) => console.error('Error in presenting the loader:', error));

        this.attendanceService.updateAttendanceById(employee.activeAttendanceId['_id'], punchOutAttendance).subscribe(
          (attendance) => {

            this.employeeService.updateEmployeeDetailsById(employee._id, {
              activeAttendanceId: ""
            }, '?activeAttendanceId=false').subscribe(
              (attendance) => {
                loader.then((response) => response.dismiss())
                .catch((error) => console.error('Error in dismissing the loader:', error));

                fromDate.setUTCDate(fromDate.getUTCDate() + 1);
                this.markAbsent(leave, fromDate, tillDate);
              },
              (error) => {
                this.errorMsg = <any>error;

                loader.then((response) => response.dismiss())
                .catch((error) => console.error('Error in dismissing the loader:', error));

                this.notificationService.showErrorToast('Error in updating active attendance details. Kindly try again after some time.', 2000, 'top');
              }
            );
          },
          (error) => {
            this.errorMsg = <any>error;

            loader.then((response) => response.dismiss())
            .catch((error) => console.error('Error in dismissing the loader:', error));

            this.notificationService.showErrorToast('Error in updating active attendance details. Kindly try again after some time.', 2000, 'top');
          }
        );
      } else {
        this.markAbsent(leave, fromDate, tillDate);
      }
    } else {
      this.markAbsent(leave, fromDate, tillDate);
    }
  }

  markAbsent(leave: Leave, fromDate: Date, tillDate: Date): void {
    this.errorMsg = undefined;

    let employee: Employee = <Employee>leave.empId;
    let leaveAttendances: Attendance[] = [];

    while (fromDate.getTime() <= tillDate.getTime()) {

      if (this.employeeService.isWorkingDay(fromDate, employee)) {
        let inTime = new Date(fromDate.toISOString().split('T')[0] + 'T' + employee.inTime.split('T')[1]);
        let outTime = new Date(fromDate.toISOString().split('T')[0] + 'T' + employee.outTime.split('T')[1]);

        let attendance: Attendance = {
          empId: employee._id,
          inTime: inTime.toISOString(),
          outTime: outTime.toISOString(),
          punchInImg: "",
          punchOutImg: "",
          punchInLocation: employee.branchId['branchLocation'],
          punchOutLocation: employee.branchId['branchLocation'],
          punchInDoneBy: secureStorage.getItem('empId'),
          punchOutDoneBy: secureStorage.getItem('empId'),
          status: (
            (leave.leaveType === 'paid') ? 'paid_leave' : 'unpaid_leave'
          ),
          locationHistory: []
        };

        leaveAttendances.push(attendance);
      }

      fromDate.setUTCDate(fromDate.getUTCDate() + 1);
    }

    tillDate.setUTCDate(tillDate.getUTCDate() + 1);

    let nextPossiblePunchIn = tillDate.toISOString().split('T')[0] + 'T' + employee.inTime.split('T')[1];

    let loader = this.notificationService.createLoader('Adding attendance details as per leave...');
    loader.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the loader:', error));

    if (leaveAttendances.length > 0) {
      let addedAttendanceCount = 0;

      leaveAttendances.forEach((attendance) => {
        this.attendanceService.addAttendance(attendance).subscribe(
          (attendance) => {
            ++addedAttendanceCount;

            if (addedAttendanceCount === leaveAttendances.length) {
              this.employeeService.updateEmployeeDetailsById(employee._id, {
                nextPossiblePunchIn: nextPossiblePunchIn
              }).subscribe(
                (employee) => {
                  this.leaveService.updateLeaveDetailsById(leave._id, {
                    status: 'approved',
                    decisionBy: secureStorage.getItem('empId')
                  }).subscribe(
                    (leave) => {
                      loader.then((response) => response.dismiss())
                      .catch((error) => console.error('Error in dismissing the loader:', error));

                      this.addChatMsg({
                        senderEmpId: secureStorage.getItem('empId'),
                        receiverEmpId: employee._id,
                        message: `Your leave application from ${this.datePipe.transform(leave.fromDate, 'MMM d, y')} to ${this.datePipe.transform(leave.tillDate, 'MMM d, y')} is approved.`
                      }, true, 'Leave approved successfully.');
                    },
                    (error) => {
                      this.errorMsg = <any>error;

                      loader.then((response) => response.dismiss())
                      .catch((error) => console.error('Error in dismissing the loader:', error));

                      this.notificationService.showErrorToast('Error in approving the leave. Kindly try again after some time.', 2000, 'top');
                    }
                  );
                },
                (error) => {
                  this.errorMsg = <any>error;

                  loader.then((response) => response.dismiss())
                  .catch((error) => console.error('Error in dismissing the loader:', error));

                  this.notificationService.showErrorToast('Error in approving the leave. Kindly try again after some time.', 2000, 'top');
                }
              );
            }
          },
          (error) => {
            this.errorMsg = <any>error;

            loader.then((response) => response.dismiss())
            .catch((error) => console.error('Error in dismissing the loader:', error));

            this.notificationService.showErrorToast('Error in adding attendance details.', 2000, 'top');
          }
        );
      });
    } else {
      this.employeeService.updateEmployeeDetailsById(employee._id, {
        nextPossiblePunchIn: nextPossiblePunchIn
      }).subscribe(
        (employee) => {
          this.leaveService.updateLeaveDetailsById(leave._id, {
            status: 'approved',
            decisionBy: secureStorage.getItem('empId')
          }).subscribe(
            (leave) => {
              loader.then((response) => response.dismiss())
              .catch((error) => console.error('Error in dismissing the loader:', error));

              this.addChatMsg({
                senderEmpId: secureStorage.getItem('empId'),
                receiverEmpId: employee._id,
                message: `Your leave application from ${this.datePipe.transform(leave.fromDate, 'MMM d, y')} to ${this.datePipe.transform(leave.tillDate, 'MMM d, y')} is approved.`
              }, true, 'Leave approved successfully.');
            },
            (error) => {
              this.errorMsg = <any>error;

              loader.then((response) => response.dismiss())
              .catch((error) => console.error('Error in dismissing the loader:', error));

              this.notificationService.showErrorToast('Error in approving the leave. Kindly try again after some time.', 2000, 'top');
            }
          );
        },
        (error) => {
          this.errorMsg = <any>error;

          loader.then((response) => response.dismiss())
          .catch((error) => console.error('Error in dismissing the loader:', error));

          this.notificationService.showErrorToast('Error in approving the leave. Kindly try again after some time.', 2000, 'top');
        }
      );
    }
  }

  rejectLeave(leave: Leave): void {
    this.errorMsg = undefined;

    let loader = this.notificationService.createLoader('Rejecting leave application...');
    loader.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the loader:', error));

    this.leaveService.updateLeaveDetailsById(leave._id, {
      status: 'rejected',
      decisionBy: secureStorage.getItem('empId')
    }).subscribe(
      (leave) => {
        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.addChatMsg({
          senderEmpId: secureStorage.getItem('empId'),
          receiverEmpId: leave.empId['_id'],
          message: `Your leave application from ${this.datePipe.transform(leave.fromDate, 'MMM d, y')} to ${this.datePipe.transform(leave.tillDate, 'MMM d, y')} is rejected.`
        }, true, 'Leave rejected successfully.');
      },
      (error) => {
        this.errorMsg = <any>error;

        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showErrorToast('Error in rejecting the leave. Kindly try again after some time.', 2000, 'top');
      }
    );
  }

  addChatMsg(chat: Chat, isForLeave: boolean, toastMsg: string): void {
    this.errorMsg = undefined;

    let loader = this.notificationService.createLoader('Sending notification to the employee...');
    loader.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the loader:', error));

    this.chatService.addChatMsg(chat).subscribe(
      (chat) => {
        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showToast(toastMsg, 2000, 'top');

        (isForLeave) ? this.getUnapprovedLeaves() : this.getUnapprovedSalaryAdvances();
      },
      (error) => {
        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showErrorToast('Error in sending notification to the employee. Kindly try again after some time', 2000, 'top');
      }
    );
  }

  // Add Salary Advance Request
  addSalaryAdvanceRequest(): void {
    this.errorMsg = undefined;

    let loader = this.notificationService.createLoader('Sending salary advance request...');
    loader.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the loader:', error));

    let advanceRequest = this.salaryAdvanceRequestForm.value;
    advanceRequest['empId'] = secureStorage.getItem('empId');

    this.salaryAdvService.addSalaryAdvance(advanceRequest).subscribe(
      (salaryAdvance) => {
        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.salaryAdvanceRequestForm.reset({
          advanceAmount: '',
          advanceDate: '',
          reason: '',
          status: 'in-process'
        });

        this.notificationService.showToast('Salary Advance request submitted successfully.', 2000, 'top');
      },
      (error) => {
        this.errorMsg = <any>error;

        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showErrorToast('Error in sending advance request. Please try again after some time.', 2000, 'top');
      }
    );
  }

  // Salary Advance Approval
  getSalaryAdvanceApprovalConfirmation(index: number): void {
    this.errorMsg = undefined;

    let salAdvReq: SalaryAdvance = this.unApprovedSalaryAdvances[index];
    let alertMsg = `Do you want to approve salary advance request of ${salAdvReq.empId['empName']} for \u20B9 ${salAdvReq.advanceAmount}?`;

    let alert = this.notificationService.createAlert(
      'Approve salary advance?',
      alertMsg,
      [
        {
          text: 'Reject',
          handler: () => this.shouldApproveAdvReq(salAdvReq._id, false)
        },
        {
          text: 'Approve',
          handler: () => this.shouldApproveAdvReq(salAdvReq._id, true)
        }
      ]
    );

    alert.then(
      (response) => response.present(),
      (error) => console.error("Error in presenting the alert:", error)
    );
  }

  shouldApproveAdvReq(advReqId: string, approve: boolean): void {
    this.errorMsg = undefined;

    let loader = this.notificationService.createLoader(`${
      (approve) ? 'Approving' : 'Rejecting'
    } salary advance request...`);
    loader.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the loader:', error));

    this.salaryAdvService.updateSalaryAdvanceById(advReqId, {
      status: (
        (approve) ? 'approved' : 'rejected'
      ),
      decisionBy: secureStorage.getItem('empId')
    }).subscribe(
      (salAdvReq) => {
        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.addChatMsg({
          senderEmpId: secureStorage.getItem('empId'),
          receiverEmpId: salAdvReq.empId['_id'],
          message: `Your salary advance request of \u20B9 ${salAdvReq.advanceAmount} dated ${this.datePipe.transform(salAdvReq.advanceDate, 'MMM d, y')} is ${salAdvReq.status}.`
        }, false, `Salary Advance Request ${salAdvReq.status} successfully.`);
      },
      (error) => {
        this.errorMsg = <any>error;

        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showErrorToast(`Error in ${
          (approve) ? 'approving' : 'rejecting'
        } salary advance request.`, 2000, 'top');
      }
    );
  }

  generateSalarySlip(empSalaryDetails: any): void {
    let data = {
      employee: this.employee,
      empSalaryDetails: empSalaryDetails
    };

    let modal = this.notificationService.createModal(SalarySlipPage, true, data);

    modal.then((response) => response.present())
    .catch((error) => console.error("Error in presenting the modal:", error));
  }

  generateStatement(): void {
    let data = {
      employee: this.employee
    };

    let modal = this.notificationService.createModal(StatementPage, true,  data);

    modal.then((response) => response.present())
    .catch((error) => console.error("Error in presenting the modal:", error));
  }

}
