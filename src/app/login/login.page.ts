import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { EmployeeService } from '../services/employee/employee.service';
import { NotificationService } from '../services/notification/notification.service';
import { secureStorage } from '../shared/storage';
import { formErrors, validationMessages } from '../shared/formValidation';
import { constants } from '../shared/constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm: FormGroup;
  errorMsg;
  formErrors = formErrors;
  validationMessages = validationMessages;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private employeeService: EmployeeService,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  ionViewWillEnter(): void {
    this.title.setTitle(`Login - ${constants.appName}`);
    let loggedIn = eval(secureStorage.getItem('loggedIn'));

    if (loggedIn) {
      this.router.navigateByUrl('/tabs/home');
      this.notificationService.showToast("You're already logged in.", 2000, 'top');
    }
  }

  ionViewWillLeave(): void {
    this.errorMsg = undefined;
  }

  createForm(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(15), Validators.pattern(/^[A-Za-z0-9_]*$/)]],

      password: ['', Validators.required]
    });

    this.loginForm.valueChanges
    .subscribe(
      (data) => this.onLoginFormValueChanged(data),
      (error) => console.error("Error in tracking login form changes:", error)
    );

    this.onLoginFormValueChanged();
  }

  onLoginFormValueChanged(data?: any): void {
    if (!this.loginForm) {
      return;
    } else {
      const FORM = this.loginForm;
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

  logIn(): void {
    this.errorMsg = undefined;

    let credentials = Object.assign({}, this.loginForm.value);

    let loader = this.notificationService.createLoader('Validating credentials...');
    loader.then((response) => response.present())
    .catch((error) => console.error("Error in presenting the loader:", error));

    this.authService.logIn(credentials)
    .subscribe(
      (response) => {
        loader.then((response) => response.dismiss())
        .catch((error) => console.error("Error in dismissing the loader:", error));

        if (response.success) {
          this.notificationService.showToast(response.status, 2000, 'top');

          this.loginForm.reset();

          secureStorage.setItem("loggedIn", "true");
          secureStorage.setItem("jwtToken", response.token);
          this.authService.setEmployeeId();

          let empId = secureStorage.getItem('empId');

          if (empId != null) {
            this.employeeService.getEmployeeDetailsById(empId)
            .subscribe(
              (employee) => {
                if (!employee.isActive || !employee.hasApproval) {
                  this.notificationService.showErrorToast('Please contact your Company Admin or Branch Manager for profile activation.', 2000, 'top');

                  secureStorage.clear();
                  return;
                }

                secureStorage.setItem('companyId', employee.companyId['_id']);
                secureStorage.setItem('branchId', employee.branchId['_id']);

                if (employee.position === "admin" || employee.position === 'company_admin' || employee.position === 'branch_manager')
                  secureStorage.setItem('position', employee.position);
                else
                  secureStorage.setItem('position', 'employee');

                this.router.navigateByUrl('/tabs/home', {
                  state: employee
                });
              },
              (error) => {
                this.errorMsg = <any>error;

                this.notificationService.showErrorToast('Error in getting employee details.', 2000, 'top');
              }
            );
          }
        }
      },
      (error) => {
        loader.then((response) => response.dismiss())
        .catch((error) => console.error("Error in dismissing the loader:", error));

        this.errorMsg = <any>error;

        this.notificationService.showErrorToast('Password or username is incorrect.', 2000, 'top');
      }
    );
  }

}
