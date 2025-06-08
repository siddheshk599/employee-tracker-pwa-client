import { functions } from './../shared/functions';
import { constants } from './../shared/constants';
import { validationMessages, formErrors } from './../shared/formValidation';
import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../services/employee/employee.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../services/notification/notification.service';
import { FileOperationsService } from '../services/file-operations/file-operations.service';
import { Title } from '@angular/platform-browser';
import { CompanyService } from '../services/company/company.service';
import Company from '../shared/models/company.model';
import Employee from '../shared/models/employee.model';
import { secureStorage } from '../shared/storage';

@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.page.html',
  styleUrls: ['./edit-employee.page.scss'],
})
export class EditEmployeePage implements OnInit {

  employee: Employee;
  editEmployeeForm: FormGroup;
  imageChanges: any = {};
  companies: Company[];
  urlEmpId: string;
  errorMsg;
  formErrors = formErrors;
  validationMessages = validationMessages;
  storageEmpPosition: string;
  companyIndex: number;
  maxDob: number = new Date().getFullYear() - 18;
  maxJoiningDate = new Date().toISOString();
  sharedFunctions = functions;

  salaryTypes = constants.salaryTypes;
  workingDays = constants.weekDays;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private fileOpsService: FileOperationsService,
    private title: Title,
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  ionViewWillEnter(): void {
    this.title.setTitle(`Edit Employee - ${constants.appName}`);
    this.companyIndex = 0;
    this.storageEmpPosition = secureStorage.getItem('position');

    if (history.state['_id']) {
      this.employee = history.state;
      this.getCompanyDetails();
      this.patchDataToForm(this.employee);
    } else {
      this.getEmployeeDetailsById(this.activatedRoute.snapshot.paramMap.get('employeeId'));
    }
  }

  ionViewWillLeave(): void {
    this.errorMsg = undefined;
    this.employee = undefined;
  }

  createForm(): void {
    this.editEmployeeForm = this.formBuilder.group({
      companyId: ['', Validators.required],

      branchId: ['', Validators.required],

      position: ['', Validators.required],

      empId: ['', [Validators.minLength(2), Validators.maxLength(7), Validators.pattern("^[a-zA-Z0-9]+$")]],

      empName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(25), Validators.pattern("^[a-zA-Z \.\']+$")]],

      mobileNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(/^[6-9]\d{9}$/g)]],

      workingDays: [['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], [Validators.required, Validators.min(1), Validators.max(7)]],

      inTime: ['', Validators.required],

      outTime: ['', Validators.required],

      canPunchInOutAnywhere: [false, Validators.required],

      salaryType: ['daily', Validators.required],

      salaryAmount: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4), Validators.min(100), Validators.max(9999)]],

      joiningDate: [''],

      emailId: ['', [Validators.email, Validators.minLength(6)]],

      dob: [''],

      address: ['', [Validators.minLength(20), Validators.maxLength(100), Validators.pattern(/[A-Za-z]+[0-9\.\,\/\s]*/g)]],

      bankAccNo: ['', [Validators.minLength(10), Validators.maxLength(20), Validators.pattern("^[0-9]+$")]],

      bankIfsc: ['', [Validators.minLength(11), Validators.maxLength(11), Validators.pattern("^[A-Z]{4}[A-Z0-9]{7}$")]],

      aadhaar: ['', [Validators.minLength(12), Validators.maxLength(12), Validators.pattern(/^[0-9]{12}$/g)]],

      pan: ['', [Validators.minLength(10), Validators.maxLength(10), Validators.pattern("^[A-Z]{5}[0-9]{4}[A-Z]{1}$")]],

      username: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(15), Validators.pattern(/^[A-Za-z0-9_]*$/)]],

      password: [''],

      isActive: [true],

      hasApproval: [false],

      photoImg: ''
    });

    this.editEmployeeForm.valueChanges
    .subscribe((data) => this.onEditEmpFormValueChanged(data));

    this.onEditEmpFormValueChanged();
  }

  onEditEmpFormValueChanged(data?: any) {
    if (!this.editEmployeeForm) {
      return;
    } else {
      const FORM = this.editEmployeeForm;
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

  patchDataToForm(employee: Employee): void {
    this.editEmployeeForm.patchValue({
      position: employee.position,
      empId: employee.empId,
      empName: employee.empName,
      mobileNumber: employee.mobileNumber,
      workingDays: employee.workingDays,
      inTime: employee.inTime,
      outTime: employee.outTime,
      canPunchInOutAnywhere: employee.canPunchInOutAnywhere,
      salaryType: employee.salaryType,
      salaryAmount: employee.salaryAmount,
      joiningDate: employee.joiningDate,
      emailId: employee.emailId,
      dob: employee.dob,
      address: employee.address,
      bankAccNo: employee.bankAccNo,
      bankIfsc: employee.bankIfsc,
      aadhaar: employee.aadhaar,
      pan: employee.pan,
      username: employee.username,
      isActive: employee.isActive,
      hasApproval: employee.hasApproval
    });
  }

  showUpdateOrApprovalToast(oldApprovalStatus: boolean, newApprovalStatus: boolean): void {
    if (oldApprovalStatus && !newApprovalStatus) {
      this.notificationService.showToast("Changes to the profile will be approved by either Admin or Company Admin.", 2000, 'top');

    } else if (!oldApprovalStatus && newApprovalStatus) {
      this.notificationService.showToast("Employee's profile has been approved successfully.", 2000, 'top');

    } else {
      this.notificationService.showToast("Employee's details have been updated successfully.", 2000, 'top');
    }

    this.router.navigateByUrl('/tabs/employee');
  }

  getEmployeeDetailsById(empId: string): void {
    this.employee = undefined;
    this.errorMsg = undefined;

    this.employeeService.getEmployeeDetailsById(empId)
    .subscribe(
      (employee) => {
        this.employee = employee;
        this.getCompanyDetails();
        this.patchDataToForm(this.employee);
      },
      (error) => {
        this.errorMsg = <any>error;

        this.notificationService.showErrorToast("Error in getting employee's details.", 2000, 'top');
      }
    );
  }

  getCompanyDetails(): void {
    this.companies = [];
    this.errorMsg = undefined;

    if (this.storageEmpPosition === 'admin') {
      this.companyService.getAllCompanyDetails().subscribe(
        (companies) => {
          this.companies = [...companies];
          this.editEmployeeForm.patchValue({
            companyId: this.employee.companyId['_id'],
            branchId: this.employee.branchId['_id']
          });
        },
        (error) => {
          this.errorMsg = <any>error;

          this.notificationService.showErrorToast("Error in getting company's details.", 2000, 'top')
        }
      );
    } else if (this.storageEmpPosition === 'company_admin') {
      this.companies.push(<Company>this.employee['companyId']);

      this.editEmployeeForm.patchValue({
        companyId: this.employee.companyId['_id'],
        branchId: this.employee.branchId['_id']
      });

    } else if (this.storageEmpPosition === 'branch_manager') {
      this.employee.companyId['branches'] = this.employee.companyId['branches'].filter((branch) => branch._id === secureStorage.getItem('branchId'));

      this.companies.push(<Company>this.employee.companyId);

      this.editEmployeeForm.patchValue({
        companyId: this.employee.companyId['_id'],
        branchId: this.employee.branchId['_id']
      });
    }
  }

  onChange(event, fieldName: string): void {
    if (fieldName === 'photoImg') {
      this.imageChanges[fieldName] = event.target.files[0];
    } else if (fieldName === 'companyId') {
      this.companyIndex = this.companies.map((company) => company._id).indexOf(this.editEmployeeForm.get('companyId').value);

      this.editEmployeeForm.patchValue({
        branchId: ''
      });
    }
  }

  editEmployeeDetails(): void {
    let processName = (this.employee.hasApproval) ? 'Updating' : 'Approving';

    let loader = this.notificationService.createLoader(processName + ' details of employee...');
    loader.then((response) => response.present())
    .catch((error) => console.error("Error in presenting the loader:", error));

    let detailChanges = {};
    detailChanges['hasApproval'] = (this.storageEmpPosition === 'branch_manager') ? false : true;

    Object.keys(this.editEmployeeForm.controls).forEach((controlName) => {
      let formControl = this.editEmployeeForm.controls[controlName];

      if (formControl.dirty) {
        detailChanges[controlName] = formControl.value;
      }
    });

    let count = 0;
    let imageChangesKeyCount = Object.keys(this.imageChanges).length;

    if (imageChangesKeyCount > 0) {
      let reader = new FileReader();

      for (let key in this.imageChanges) {

        if (this.employee[key]) {
          this.fileOpsService.deleteAnImage(this.employee[key])
          .subscribe(
            (response) => {
              if (response.success) {
                ++count;
                if (count === imageChangesKeyCount) {
                  count = 0;
                }

              } else {
                this.notificationService.showErrorToast('Error in deleting previously uploaded image.', 2000, 'top');
              }
            },
            (error) => {
              this.errorMsg = <any>error;

              this.notificationService.showErrorToast('Error in deleting previously uploaded image.', 2000, 'top');
            }
          );
        }

        reader.readAsDataURL(this.imageChanges[key]);
        reader.onload = (e) => {
          let dataUri = <string>reader.result;
          let base64Data = dataUri.split('base64,')[1];

          this.fileOpsService.addAnImage(
            base64Data,
            `${key.split('I')[0].toLowerCase()}_${new Date().getTime()}.jpg`,
            key.split('I')[0]
          ).subscribe(
            (response) => {
              if (response.success) {
                detailChanges[key] = response.imagePath;
                ++count;

                if (count === imageChangesKeyCount) {
                  this.updateEmployeeDetails(this.employee, detailChanges, loader);
                }
              } else {
                this.notificationService.showErrorToast('Error in uploading the image.', 2000, 'top');
              }
            },
            (error) => {
              this.errorMsg = <any>error;

              this.notificationService.showErrorToast('Error in uploading the image.', 2000, 'top');
            }
          );
        }
      }
    } else {
      detailChanges['hasApproval'] = (this.storageEmpPosition === 'branch_manager') ? false : true;

      this.updateEmployeeDetails(this.employee, detailChanges, loader);
    }
  }

  updateEmployeeDetails(employee: Employee, detailChanges: any, loader: Promise<any>): void {
    this.employeeService.updateEmployeeDetailsById(employee._id, detailChanges)
    .subscribe(
      (updatedEmployeeDetails) => {
        loader.then((response) => response.dismiss())
        .catch((error) => console.error("Error in dismissing the loader:", error));

        if (detailChanges['password']) {
          this.employeeService.resetPasswordById(employee._id, {
            password: detailChanges['password']
          })
          .subscribe(
            (response) => {
              if (response['success']) {
                this.showUpdateOrApprovalToast(employee.hasApproval, updatedEmployeeDetails.hasApproval);
              } else {
                this.notificationService.showErrorToast('Error in changing the password of employee.', 2000, 'top');
              }
            },
            (error) => {
              this.errorMsg = <any>error;

              this.notificationService.showErrorToast('Error in updating employee details.', 2000, 'top');
            }
          );
        } else {
          this.showUpdateOrApprovalToast(employee.hasApproval, updatedEmployeeDetails.hasApproval);
        }
      },
      (error) => console.error("Error in updating employee details:", error)
    );
  }

}
