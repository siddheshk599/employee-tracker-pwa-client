import { functions } from './../shared/functions';
import { ActivatedRoute } from '@angular/router';
import { formErrors, validationMessages } from './../shared/formValidation';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { EmployeeService } from '../services/employee/employee.service';
import { LeaveService } from '../services/leave/leave.service';
import { NotificationService } from '../services/notification/notification.service';
import Employee from '../shared/models/employee.model';
import Leave from '../shared/models/leave.model';
import { secureStorage } from '../shared/storage';
import { constants } from '../shared/constants';

@Component({
  selector: 'app-leave',
  templateUrl: './leave.page.html',
  styleUrls: ['./leave.page.scss'],
})
export class LeavePage implements OnInit {

  employee: Employee;
  submitLeaveForm: FormGroup;
  errorMsg;
  minDate: string = new Date().toISOString();

  validationMessages = validationMessages;
  formErrors = formErrors;
  leaveTypes: string[] = ['unpaid', 'paid'];
  sharedFunctions = functions;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  ionViewWillEnter(): void {
    this.title.setTitle(`Leave - ${constants.appName}`);

    if (history.state['_id']) {
      this.employee = history.state;
    } else {
      this.getEmployeeDetailsById(this.activatedRoute.snapshot.paramMap.get('employeeId'));
    }
  }

  ionViewWillLeave(): void {
    this.errorMsg = undefined;
  }

  createForm(): void {
    this.submitLeaveForm = this.formBuilder.group({
      fromDate: ['', Validators.required],
      tillDate: ['', Validators.required],
      leaveType: ['unpaid', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(50), Validators.pattern(/[A-Za-z]+[0-9\s\.\,\-\@\#\$\%]*/)]],
      status: ['in-process']
    });

    this.submitLeaveForm.valueChanges.subscribe(
      (data) => this.onSubmitLeaveFormValueChanged(data)
    );

    this.onSubmitLeaveFormValueChanged();
  }

  onSubmitLeaveFormValueChanged(data?: any) {
    if (!this.submitLeaveForm) {
      return;
    } else {
      const FORM = this.submitLeaveForm;
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

  getEmployeeDetailsById(empId: string): void {
    this.employee = undefined;
    this.errorMsg = undefined;

    this.employeeService.getEmployeeDetailsById(empId).subscribe(
      (employee) => {
        this.employee = employee;
      },
      (error) => {
        this.errorMsg = <any>error;

        this.notificationService.showErrorToast(`Error in getting ${
          (secureStorage.getItem('position') === 'employee') ? "your" : "employee's"
        } details.`, 2000, 'top');
      }
    );
  }

  getLeaveConfirmation(): void {
    let leave: Leave = this.submitLeaveForm.value;
    leave['empId'] = this.employee._id;

    let leaveFromDate = new Date(leave.fromDate);
    let leaveTillDate = new Date(leave.tillDate);

    if (leaveFromDate.getTime() <= leaveTillDate.getTime()) {
      let alert = this.notificationService.createAlert(
        'Apply for leave?',
        'Submitted leave will be active once approved by your Company Admin or Branch Manager.',
        [
          {
            text: 'NO',
            role: 'cancel'
          },
          {
            text: 'YES',
            handler: () => this.submitLeave(leave)
          }
        ]
      );

      alert.then(
        (response) => response.present(),
        (error) => console.error("Error in presenting the alert:", error)
      );

    } else if (leaveFromDate.getTime() > leaveTillDate.getTime()) {
      this.notificationService.showErrorToast('From Date must be before or same as the Till Date of the leave application.', 2000, 'top');
    }
  }

  submitLeave(leave: Leave): void {
    this.errorMsg = undefined;

    let loader = this.notificationService.createLoader('Submitting your leave application...');
    loader.then((response) => response.present())
    .catch((error) => console.error("Error in presenting the loader:", error));

    this.leaveService.addLeaveToDb(leave).subscribe(
      (leave) => {
        loader.then((response) => response.dismiss())
        .catch((error) => console.error("Error in dismissing the loader:", error));

        this.submitLeaveForm.reset({
          fromDate: '',
          tillDate: '',
          leaveType: 'unpaid',
          reason: '',
          status: 'in-process'
        });

        this.notificationService.showToast('Leave application submitted successfully.', 2000, 'top');
      },
      (error) => {
        this.errorMsg = <any>error;

        loader.then((response) => response.dismiss())
        .catch((error) => console.error("Error in dismissing the loader:", error));

        this.notificationService.showErrorToast("Error in submitting the leave application.", 2000, 'top');
      }
    );
  }
}
