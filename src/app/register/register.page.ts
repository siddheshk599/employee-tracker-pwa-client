import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BranchService } from './../services/branch/branch.service';
import { CompanyService } from './../services/company/company.service';
import { EmployeeService } from './../services/employee/employee.service';
import { FileOperationsService } from './../services/file-operations/file-operations.service';
import { LocationService } from './../services/location/location.service';
import { NotificationService } from './../services/notification/notification.service';
import { constants } from './../shared/constants';
import { formErrors, validationMessages } from './../shared/formValidation';
import { functions } from './../shared/functions';
import Company from '../shared/models/company.model';
import CompanyBranch from '../shared/models/company-branch.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  imageFileList = {};
  locationAddress: string;
  registerUserForm: FormGroup;
  addCompanyForm: FormGroup;

  errorMsg;
  formErrors = formErrors;
  validationMessages = validationMessages;
  sharedFunctions = functions;
  workingDays: string[] = constants.weekDays;

  salaryTypes: string[] = constants.salaryTypes;
  maxDob: number = new Date().getFullYear() - 18;
  maxJoiningDate = new Date().toISOString();
  companyLocation: { latitude: number, longitude: number } = {
    latitude: undefined,
    longitude: undefined
  };
  googleMapsURL: SafeResourceUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(constants.indiaMapURL);

  constructor(
    private router: Router,
    private title: Title,
    private domSanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private locationService: LocationService,
    private companyService: CompanyService,
    private branchService: BranchService,
    private fileOpsService: FileOperationsService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.googleMapsURL = this.domSanitizer.bypassSecurityTrustResourceUrl(constants.indiaMapURL);
  }

  ionViewWillEnter(): void {
    this.title.setTitle(`Register - ${constants.appName}`);
  }

  ionViewWillLeave(): void {
    this.errorMsg = undefined;
    this.resetMapAndGpsCoords();
  }

  createForm(): void {
    // Register User form
    this.registerUserForm = this.formBuilder.group({
      position: ['company_admin', Validators.required],

      empId: ['', [Validators.minLength(2), Validators.maxLength(7), Validators.pattern('^[a-zA-Z0-9]+$')]],

      empName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(25), Validators.pattern('^[a-zA-Z \.\']+$')]],

      mobileNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(/^[6-9]\d{9}$/g)]],

      workingDays: [['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], [Validators.required, Validators.min(1), Validators.max(7)]],

      inTime: ['', Validators.required],

      outTime: ['', Validators.required],

      canPunchInOutAnywhere: [true, Validators.required],

      salaryType: ['daily', Validators.required],

      salaryAmount: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4), Validators.min(100), Validators.max(9999)]],

      joiningDate: '',

      emailId: ['', [Validators.email, Validators.minLength(6)]],

      dob: '',

      address: ['', [Validators.minLength(20), Validators.maxLength(100), Validators.pattern(/[A-Za-z]+[0-9\.\,\/\s]*/g)]],

      bankAccNo: ['', [Validators.minLength(10), Validators.maxLength(20), Validators.pattern('^[0-9]+$')]],

      bankIfsc: ['', [Validators.minLength(11), Validators.maxLength(11), Validators.pattern('^[A-Z]{4}[A-Z0-9]{7}$')]],

      aadhaar: ['', [Validators.minLength(12), Validators.maxLength(12), Validators.pattern(/^[0-9]{12}$/g)]],

      pan: ['', [Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')]],

      username: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(15), Validators.pattern(/^[A-Za-z0-9_]*$/)]],

      password: ['', Validators.required],

      isActive: [true, Validators.required],

      hasApproval: [true, Validators.required],

      photoImg: '',

      nextPossiblePunchIn: ''
    });

    // Add Company form
    this.addCompanyForm = this.formBuilder.group({
      companyName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50), Validators.pattern(/[A-Za-z]+[0-9\.\,\/\s]*/g)]],

      companyAddress: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(100), Validators.pattern(/[A-Za-z]+[0-9\.\,\/\s]*/g)]],

      branchName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50), Validators.pattern(/[A-Za-z]+[0-9\.\,\/\s]*/g)]]
    });

    // Register User form validation
    this.registerUserForm.valueChanges
    .subscribe((data) => {
      this.onRegisterUserFormValueChanged(data);
    });

    this.onRegisterUserFormValueChanged();

    // Add Company form validation
    this.addCompanyForm.valueChanges
    .subscribe((data) => {
      this.onAddCompanyFormValueChanged(data);
    });

    this.onAddCompanyFormValueChanged();
  }

  onRegisterUserFormValueChanged(data?: any): void {
    if (!this.registerUserForm) {
      return;
    } else {
      const FORM = this.registerUserForm;
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

  onAddCompanyFormValueChanged(data?: any): void {
    if (!this.addCompanyForm) {
      return;
    } else {
      const FORM = this.addCompanyForm;
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

  resetAddUserAndAddCompanyForm(): void {
    this.imageFileList = {};

    this.registerUserForm.reset({
      position: 'company_admin',
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

    this.addCompanyForm.reset({
      companyName: '',
      companyAddress: '',
      branchName: ''
    });

    this.resetMapAndGpsCoords();
  }

  onImageSelected(event, imageName) {
    if (imageName === 'photoImg') {
      this.imageFileList['photoImg'] = event.target.files[0];
    }
  }

  getLocation(): void {
    this.locationService.checkAndEnableGps();
    this.companyLocation = {
      latitude: this.locationService.latitude,
      longitude: this.locationService.longitude
    };

    let loader = this.notificationService.createLoader('Getting your current location...', true);
    loader.then((response) => response.present())
    .catch((error) => console.error('Error in getting location: ', error));

    if (this.companyLocation.latitude !== undefined && this.companyLocation.longitude !== undefined) {
      this.companyLocation.latitude = parseFloat(this.companyLocation.latitude.toFixed(4));

      this.companyLocation.longitude = parseFloat(this.companyLocation.longitude.toFixed(4));

      this.googleMapsURL = this.locationService.getGoogleMapsURLForCoordinates(
        constants.googleMapsQueryURL,
        this.companyLocation
      );

    } else {
      this.notificationService.showErrorToast('Error in getting location. Please try again.', 2000, 'top');
    }

    loader.then(
      (response) => response.dismiss()
    )
    .catch((error) => console.error('Error in dismissing loader: ', error));
  }

  getLocationByAddress(): void {
    let address = this.locationAddress.trim();
    let addressRegex = new RegExp(/[A-Za-z]+[0-9\s\.\,\-\'\']*/);

    if (addressRegex.test(address)) {
      let loader = this.notificationService.createLoader('Getting location...');

      loader.then((response) => response.present())
      .catch((error) => console.error('Error in presenting the loader:', error));

      this.locationService.forwardGeocoding(address).then(
        (result) => {
          loader.then((response) => response.dismiss())
          .catch((error) => console.error('Error in dismissing the loader:', error));

          if (result != undefined && result !== null && result.length > 0) {
            this.companyLocation.latitude = this.sharedFunctions.roundTo4Decimals(result[0].latitude);
            this.companyLocation.longitude = this.sharedFunctions.roundTo4Decimals(result[0].longitude);

            this.googleMapsURL = this.locationService.getGoogleMapsURLForCoordinates(
              constants.googleMapsQueryURL,
              this.companyLocation
            );

          } else {
            this.notificationService.showErrorToast('Location not found. Please try again.', 2000, 'top');
          }
        },
        (error) => {
          this.errorMsg = <any>error;

          loader.then((response) => response.dismiss())
          .catch((error) => console.error('Error in dismissing the loader:', error));

          this.notificationService.showErrorToast('Error in getting the location by address. Please try again.', 2000, 'top');
        }
      );

    } else {
      this.notificationService.showErrorToast('Enter a valid location address.', 2000, 'top');
    }
  }

  resetMapAndGpsCoords(): void {
    this.googleMapsURL = this.domSanitizer.bypassSecurityTrustResourceUrl(constants.indiaMapURL);

    this.locationAddress = undefined;
    this.companyLocation = {
      latitude: undefined,
      longitude: undefined
    };
  }

  registerUser(): void {
    this.errorMsg = undefined;

    if (this.companyLocation.latitude !== undefined && this.companyLocation.longitude !== undefined) {
      this.addCompany();

    } else {
      this.notificationService.createAlert('Location not available', 'Kindly get your company\'s location.', ['OK'])
      .then((alert) => alert.present());
    }
  }

  addCompany(): void {
    const loader = this.notificationService.createLoader('Creating your account...');

    loader.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the loader:', error));

    const addCompanyFormValue: any = this.addCompanyForm.value;

    const companyDetails: Company = {
      companyName: addCompanyFormValue['companyName'].trim(),
      companyAddress: addCompanyFormValue['companyAddress'].trim(),
      companyLocation: this.companyLocation,
      positions: ['company_admin', 'branch_manager'],
      branches: []
    };

    const branchDetails: CompanyBranch = {
      branchName: addCompanyFormValue['branchName'].trim(),
      branchAddress: addCompanyFormValue['companyAddress'].trim(),
      branchLocation: this.companyLocation,
      companyId: ''
    };

    this.companyService.addCompanyToDb(companyDetails)
    .subscribe(
      (company) => {
        branchDetails['companyId'] = company._id;

        this.branchService.addBranchToDb(branchDetails)
        .subscribe(
          (branch) => {
            this.companyService.addBranchIdToCompany(branch._id, company._id).subscribe(
              (company) => {
                this.addUser(loader, company._id, branch._id);
              },
              (error) => {
                this.errorMsg = <any>error;

                loader.then((response) => response.dismiss())
                .catch((error) => console.error('Error in presenting the loader:', error));

                this.notificationService.showErrorToast('Error in adding branch details to the company.', 2000, 'top');
              }
            )
          },
          (error) => {
            this.errorMsg = <any>error;

            loader.then((response) => response.dismiss())
            .catch((error) => console.error('Error in presenting the loader:', error));

            this.notificationService.showErrorToast('Error in adding the branch details.', 2000, 'top');
          }
        );
      },
      (error) => {
        this.errorMsg = <any>error;

        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in presenting the loader:', error));

        this.notificationService.showErrorToast('Error in adding company details.', 2000, 'top');
      }
    );
  }

  addUser(loader: Promise<HTMLIonLoadingElement>, companyId: string, branchId: string): void {
    let registerUserFormValue = Object.assign({}, this.registerUserForm.value);
    let count = 0;

    registerUserFormValue.empName = registerUserFormValue.empName.trim();
    registerUserFormValue['nextPossiblePunchIn'] = registerUserFormValue['inTime'];
    registerUserFormValue['companyId'] = companyId;
    registerUserFormValue['branchId'] = branchId;

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
                registerUserFormValue[key] = result.imagePath;
                ++count;

                if (count === imageListKeyCount) {
                  this.employeeService.addEmployee(registerUserFormValue)
                  .subscribe(
                    (response) => {
                      loader.then((response) => response.dismiss())
                      .catch((error) => console.error('Error in dismissing the loader:', error));

                      this.notificationService.showToast('You have been registered successfully. Kindly login to proceed.', 2000, 'top');

                      this.resetMapAndGpsCoords();
                      this.resetAddUserAndAddCompanyForm();

                      this.router.navigateByUrl('/login');
                    },
                    (error) => {
                      this.errorMsg = <any>error;

                      loader.then((response) => response.dismiss())
                      .catch((error) => console.error('Error in dismissing the loader:', error));

                      this.notificationService.showErrorToast('Error in creating your account. Kindly try again after some time.', 2000, 'top');
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
      this.employeeService.addEmployee(registerUserFormValue)
      .subscribe(
        (response) => {
          loader.then((response) => response.dismiss())
          .catch((error) => console.error('Error in dismissing the loader:', error));

          this.notificationService.showToast('You have been registered successfully. Kindly login to proceed.', 2000, 'top');

          this.resetMapAndGpsCoords();
          this.resetAddUserAndAddCompanyForm();
        },
        (error) => {
          this.errorMsg = <any>error;

          loader.then((response) => response.dismiss())
          .catch((error) => console.error('Error in dismissing the loader:', error));

          this.notificationService.showErrorToast('Error in creating your account. Kindly try again after some time.', 2000, 'top');
        }
      );
    }
  }

}
