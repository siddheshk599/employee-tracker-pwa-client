import { functions } from './../shared/functions';
import { constants } from './../shared/constants';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileOperationsService } from '../services/file-operations/file-operations.service';
import { NotificationService } from '../services/notification/notification.service';
import { EmployeeService } from '../services/employee/employee.service';
import { Title } from '@angular/platform-browser';
import { CompanyService } from '../services/company/company.service';
import { secureStorage } from '../shared/storage';
import { formErrors, validationMessages } from '../shared/formValidation';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.page.html',
  styleUrls: ['./add-employee.page.scss'],
})
export class AddEmployeePage implements OnInit {

  addEmployeeForm: FormGroup;
  imageFileList = {};
  companies: any[];
  companyIndex: number = 0;
  errorMsg;
  storageEmpPosition: string;
  maxDob: number = new Date().getFullYear() - 18;
  maxJoiningDate = new Date().toISOString();
  formErrors = formErrors;
  validationMessages = validationMessages;
  sharedFunctions = functions;

  salaryTypes = constants.salaryTypes;
  workingDays = constants.weekDays;

  constructor(
    private formBuilder: FormBuilder,
    private fileOpsService: FileOperationsService,
    private notificationService: NotificationService,
    private employeeService: EmployeeService,
    private title: Title,
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  ionViewWillEnter(): void {
    this.title.setTitle(`Add Employee - ${constants.appName}`);
    this.storageEmpPosition = secureStorage.getItem('position');
    this.companyIndex = 0;
    this.getCompanyDetails();
  }

  ionViewWillLeave(): void {
    this.errorMsg = undefined;
  }

  createForm(): void {
    this.addEmployeeForm = this.formBuilder.group({
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

      joiningDate: '',

      emailId: ['', [Validators.email, Validators.minLength(6)]],

      dob: '',

      address: ['', [Validators.minLength(20), Validators.maxLength(100), Validators.pattern(/[A-Za-z]+[0-9\.\,\/\s]*/g)]],

      bankAccNo: ['', [Validators.minLength(10), Validators.maxLength(20), Validators.pattern("^[0-9]+$")]],

      bankIfsc: ['', [Validators.minLength(11), Validators.maxLength(11), Validators.pattern("^[A-Z]{4}[A-Z0-9]{7}$")]],

      aadhaar: ['', [Validators.minLength(12), Validators.maxLength(12), Validators.pattern(/^[0-9]{12}$/g)]],

      pan: ['', [Validators.minLength(10), Validators.maxLength(10), Validators.pattern("^[A-Z]{5}[0-9]{4}[A-Z]{1}$")]],

      username: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(15), Validators.pattern(/^[A-Za-z0-9_]*$/)]],

      password: ['', Validators.required],

      isActive: [true, Validators.required],

      hasApproval: [true, Validators.required],

      photoImg: '',

      nextPossiblePunchIn: ''
    });

    this.addEmployeeForm.valueChanges
    .subscribe((data) => {
      this.onAddEmpFormValueChanged(data);
    });

    this.onAddEmpFormValueChanged();
  }

  onAddEmpFormValueChanged(data?: any) {
    if (!this.addEmployeeForm) {
      return;
    } else {
      const FORM = this.addEmployeeForm;
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

  workHrsMinMax(hours: number): string {
    let date = new Date(new Date().toISOString());
    date.setUTCMinutes(hours);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);

    return date.toISOString();
  }

  profileApprovalAlert(): void {
    if (this.storageEmpPosition === 'branch_manager') {
      let alert = this.notificationService.createAlert(
        'Ask for profile approval?',
        'Would you like to submit employee profile for approval or add profile without approval?',
        [
          {
            text: 'Cancel',
            handler: () => { return }
          },
          {
            text: 'Add directly',
            handler: () => this.addEmployee()
          },
          {
            text: 'Ask for Approval',
            handler: () => {
              this.addEmployeeForm.patchValue({ hasApproval: false });
              this.addEmployee();
            }
          }
        ]
      );

      alert.then((response) => response.present())
      .catch((error) => console.error("Error in presenting the alert:", error));

    } else {
      this.addEmployee();
    }
  }

  addEmployee(): void {
    this.errorMsg = undefined;

    let loader = this.notificationService.createLoader('Adding employee details...');
    loader.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the loader:', error));

    let addEmpFormValue = Object.assign({}, this.addEmployeeForm.value);
    let count = 0;

    addEmpFormValue.empName = addEmpFormValue.empName.trim();

    addEmpFormValue['canPunchInOutAnywhere'] = (addEmpFormValue['position'] === 'branch_manager') ? true : false;

    addEmpFormValue['nextPossiblePunchIn'] = addEmpFormValue['inTime'];

    let imageListKeyCount = Object.keys(this.imageFileList).length;

    if (imageListKeyCount > 0) {
      let reader = new FileReader();

      for (let key in this.imageFileList) {
        reader.readAsDataURL(this.imageFileList[key]);
        reader.onload = (e) => {
          let dataUri = <string>reader.result;
          let base64Data = dataUri.split('base64,')[1];

          this.fileOpsService.addAnImage(
            base64Data,
            `${key.split('I')[0].toLowerCase()}_${new Date().getTime()}.jpg`,
            key.split('I')[0]
          ).subscribe(
            (result) => {
              loader.then((response) => response.dismiss())
              .catch((error) => console.error('Error in dismissing the loader:', error));

              if (result.success) {
                addEmpFormValue[key] = result.imagePath;
                ++count;

                if (count === imageListKeyCount) {
                  this.employeeService.addEmployee(addEmpFormValue)
                  .subscribe(
                    (response) => {
                      loader.then((response) => response.dismiss())
                      .catch((error) => console.error('Error in dismissing the loader:', error));

                      this.notificationService.showToast('Employee details added successfully.', 2000, 'top');

                      this.resetForm();
                    },
                    (error) => {
                      this.errorMsg = <any>error;

                      loader.then((response) => response.dismiss())
                      .catch((error) => console.error('Error in dismissing the loader:', error));

                      this.notificationService.showErrorToast('Error in adding employee details.', 2000, 'top');
                    }
                  );
                }
              } else {
                this.notificationService.showErrorToast('Error in uploading the image.', 2000, 'top');
              }
            },
            (error) => {
              this.errorMsg = <any>error;

              loader.then((response) => response.dismiss())
              .catch((error) => console.error('Error in dismissing the loader:', error));

              this.notificationService.showErrorToast('Error in uploading the image.', 2000, 'top');
            }
          );
        };
      }
    } else {
      this.employeeService.addEmployee(addEmpFormValue)
      .subscribe(
        (response) => {
          loader.then((response) => response.dismiss())
          .catch((error) => console.error('Error in dismissing the loader:', error));

          this.notificationService.showToast('Employee details added successfully.', 2000, 'top');

          this.resetForm();
        },
        (error) => {
          this.errorMsg = <any>error;

          loader.then((response) => response.dismiss())
          .catch((error) => console.error('Error in dismissing the loader:', error));

          this.notificationService.showErrorToast('Error in adding employee details.', 2000, 'top');
        }
      );
    }
  }

  onImageSelected(event, imageName) {
    if (imageName === 'photoImg') {
      this.imageFileList['photoImg'] = event.target.files[0];
    }
  }

  getCompanyIndex(): void {
    this.companyIndex = this.companies.map((company) => company._id).indexOf(this.addEmployeeForm.get('companyId').value);

    this.addEmployeeForm.patchValue({
      branchId: this.companies[this.companyIndex]?.branches[0]._id
    });
  }

  getCompanyDetails(): void {
    this.errorMsg = undefined;

    if (this.storageEmpPosition === 'admin') {
      this.companyService.getAllCompanyDetails()
      .subscribe(
        (companies) => {
          this.companies = [];
          this.companies = [...companies];

          if (this.companies[this.companyIndex] && this.companies[this.companyIndex].branches) {
            this.addEmployeeForm.patchValue({
              companyId: this.companies[this.companyIndex]._id,
              branchId: this.companies[this.companyIndex].branches[0]._id
            });
          }
        },
        (error) => {
          this.errorMsg = <any>error;

          this.notificationService.showErrorToast('Error in getting the company details.', 2000, 'top');
        }
      );
    } else if (this.storageEmpPosition === 'company_admin' || this.storageEmpPosition === 'branch_manager') {
      this.employeeService.getEmployeeDetailsById(secureStorage.getItem('empId')).subscribe(
        (employee) => {
          this.companies = [];

          if (this.storageEmpPosition === 'branch_manager') {
            employee.companyId['branches'] = employee.companyId['branches'].filter((branch) => (branch._id === employee.branchId['_id']));
          }

          this.companies.push(employee.companyId);

          if (this.companies[this.companyIndex] && this.companies[this.companyIndex].branches) {
            this.addEmployeeForm.patchValue({
              companyId: this.companies[this.companyIndex]._id,
              branchId: this.companies[this.companyIndex].branches[0]._id
            });
          }
        },
        (error) => {
          this.errorMsg = <any>error;

          this.notificationService.showErrorToast('Error in getting the company details.', 2000, 'top');
        }
      );
    }
  }

  resetForm(): void {
    this.imageFileList = {};

    this.addEmployeeForm.reset({
      companyId: this.companies[0]._id,
      branchId: this.companies[0].branches[0]._id,
      position: 'executive',
      empId: '',
      empName: '',
      mobileNumber: '',
      workingDays: [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday'
      ],
      inTime: '',
      outTime: '',
      canPunchInOutAnywhere: false,
      salaryType: 'daily',
      salaryAmount: '',
      joiningDate: '',
      emailId: '',
      dob: '',
      address: '',
      bankAccNo: '',
      bankIfsc: '',
      aadhaar: '',
      pan: '',
      username: '',
      isActive: true,
      hasApproval: true,
      photoImg: '',
    });
  }
}
