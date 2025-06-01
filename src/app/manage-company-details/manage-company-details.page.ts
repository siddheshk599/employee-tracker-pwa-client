import { EditBranchesAndPositionsPage } from './../edit-branches-and-positions/edit-branches-and-positions.page';
import { constants } from '../shared/constants';
import { functions } from '../shared/functions';
import { validationMessages, formErrors } from '../shared/formValidation';
import { EmployeeService } from '../services/employee/employee.service';
import { BranchService } from '../services/branch/branch.service';
import CompanyBranch from '../shared/models/company-branch.model';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title, SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { CompanyService } from '../services/company/company.service';
import { LocationService } from '../services/location/location.service';
import { NotificationService } from '../services/notification/notification.service';
import Company from '../shared/models/company.model';
import { secureStorage } from '../shared/storage';

@Component({
  selector: 'app-manage-company-details',
  templateUrl: './manage-company-details.page.html',
  styleUrls: ['./manage-company-details.page.scss'],
})
export class ManageCompanyDetailsPage implements OnInit {

  @ViewChild('addCompanySegment') addCompanySegment: ElementRef;
  @ViewChild('addBranchSegment') addBranchSegment: ElementRef;

  addCompanyForm: FormGroup;
  addBranchForm: FormGroup;
  editCompanyForm: FormGroup;
  editBranchForm: FormGroup;

  errorMsg;
  location: {
    latitude: number,
    longitude: number
  } = {
    latitude: undefined,
    longitude: undefined
  };
  selectedCompanyId: string;
  newPosition: string;

  segmentButton: string = "addCompany";
  companies: Company[];
  empPosition: string;
  selectedCompanyIndex: number = 0;

  locationAddress: string;
  formErrors = formErrors;
  validationMessages = validationMessages;
  sharedFunctions = functions;

  googleMapsURL: SafeResourceUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(constants.indiaMapURL);

  constructor(
    private formBuilder: FormBuilder,
    private domSanitizer: DomSanitizer,
    private notificationService: NotificationService,
    private locationService: LocationService,
    private companyService: CompanyService,
    private branchService: BranchService,
    private employeeService: EmployeeService,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.googleMapsURL = this.domSanitizer.bypassSecurityTrustResourceUrl(constants.indiaMapURL);
  }

  ionViewWillEnter(): void {
    this.title.setTitle(`Manage Company Details - ${constants.appName}`);
    this.empPosition = secureStorage.getItem('position');
    this.selectedCompanyIndex = 0;
    this.newPosition = "";

    if (this.empPosition === 'admin')
      this.segmentButton = 'addCompany';
    else if (this.empPosition === 'company_admin')
      this.segmentButton = 'addBranch';
  }

  ionViewWillLeave(): void {
    this.errorMsg = undefined;
    this.segmentButton = undefined;
    this.companies = undefined;

    this.addBranchForm.reset();
    this.editCompanyForm.reset();
    this.editBranchForm.reset();
  }

  segmentChange(event) {
    if (event.target.value != 'addCompany') {
      this.resetMapAndGpsCoords();
      this.getCompanyDetails(event.target.value);
    }
  }

  createForm(): void {
    // Add Company form
    this.addCompanyForm = this.formBuilder.group({
      companyName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50), Validators.pattern(/[A-Za-z]+[0-9\.\,\/\s]*/g)]],

      companyAddress: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(100), Validators.pattern(/[A-Za-z]+[0-9\.\,\/\s]*/g)]],

      branchName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50), Validators.pattern(/[A-Za-z]+[0-9\.\,\/\s]*/g)]]
    });

    // Add branch form
    this.addBranchForm = this.formBuilder.group({
      companyId: ['', Validators.required],

      branchName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50), Validators.pattern(/[A-Za-z]+[0-9\.\,\/\s]*/g)]],

      branchAddress: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(100), Validators.pattern(/[A-Za-z]+[0-9\.\,\/\s]*/g)]]
    });

    // Edit Company form
    this.editCompanyForm = this.formBuilder.group({
      companyName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50), Validators.pattern(/[A-Za-z]+[0-9\.\,\/\s]*/g)]],

      companyAddress: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(100), Validators.pattern(/[A-Za-z]+[0-9\.\,\/\s]*/g)]],

      companyLatitude: ['', Validators.required],

      companyLongitude: ['', Validators.required]
    });

    //Edit Branch form
    this.editBranchForm = this.formBuilder.group({
      branchName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50), Validators.pattern(/[A-Za-z]+[0-9\.\,\/\s]*/g)]],

      branchAddress: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(100), Validators.pattern(/[A-Za-z]+[0-9\.\,\/\s]*/g)]],

      branchLatitude: ['', Validators.required],

      branchLongitude: ['', Validators.required]
    });

    // Add Company form validation
    this.addCompanyForm.valueChanges
    .subscribe(
      (data) => this.onCompanyFormValueChanged(data)
    );

    this.onCompanyFormValueChanged();

    // Add Branch form validation
    this.addBranchForm.valueChanges
    .subscribe(
      (data) => this.onBranchFormValueChanged(data)
    );

    this.onBranchFormValueChanged();

    this.editCompanyForm.valueChanges
    .subscribe(
      (data) => this.onEditCompanyFormValueChanged(data)
    );

    this.onEditCompanyFormValueChanged();

    // Edit Branch form validation
    this.editBranchForm.valueChanges
    .subscribe(
      (data) => this.onEditBranchFormValueChanged(data)
    );

    this.onEditBranchFormValueChanged();
  }

  onCompanyFormValueChanged(data?: any) {
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

  onBranchFormValueChanged(data?: any): void {
    if (!this.addBranchForm) {
      return;
    } else {
      const FORM = this.addBranchForm;
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


  onEditCompanyFormValueChanged(data?: any): void {
    if (!this.editCompanyForm) {
      return;
    } else {
      const FORM = this.editCompanyForm;
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

  onEditBranchFormValueChanged(data?: any): void {
    if (!this.editBranchForm) {
      return;
    } else {
      const FORM = this.editBranchForm;
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

  getLocation(mode?: 'addCompany' | 'addBranch' | 'companyDetails'): void {
    this.locationService.checkAndEnableGps();
    this.location.latitude = this.locationService.latitude;
    this.location.longitude = this.locationService.longitude;

    if (this.location.latitude !== undefined && this.location.longitude !== undefined) {
      this.location = {
        latitude: this.sharedFunctions.roundTo4Decimals(this.location.latitude),
        longitude: this.sharedFunctions.roundTo4Decimals(this.location.longitude)
      };

      this.googleMapsURL = this.locationService.getGoogleMapsURLForCoordinates(
        constants.googleMapsQueryURL,
        this.location
      );

      if (mode === 'companyDetails') {
        this.editCompanyForm.patchValue({
          companyLatitude: this.location.latitude,
          companyLongitude: this.location.longitude
        });

        this.editCompanyForm.get('companyLatitude').markAsDirty();
        this.editCompanyForm.get('companyLongitude').markAsDirty();
      }
    }
  }

  getLocationByAddress(mode?: string): void {
    let address = this.locationAddress.trim();
    let addressRegex = new RegExp(/[A-Za-z]+[0-9\s\.\,\-\'\"]*/);

    if (addressRegex.test(address)) {
      let loader = this.notificationService.createLoader('Getting location...');

      loader.then((response) => response.present())
      .catch((error) => console.error('Error in presenting the loader:', error));

      this.locationService.forwardGeocoding(address).then(
        (result) => {
          loader.then((response) => response.dismiss())
          .catch((error) => console.error('Error in dismissing the loader:', error));

          if (result !== undefined && result !== null && result.length > 0) {
            this.location = {
              latitude: this.sharedFunctions.roundTo4Decimals(result[0].latitude),
              longitude: this.sharedFunctions.roundTo4Decimals(result[0].longitude)
            };

            this.googleMapsURL = this.locationService.getGoogleMapsURLForCoordinates(
              constants.googleMapsQueryURL,
              this.location
            );

            if (mode === 'companyDetails') {
              this.editCompanyForm.patchValue({
                companyLatitude: this.location.latitude,
                companyLongitude: this.location.longitude
              });

              this.editCompanyForm.get('companyLatitude').markAsDirty();
              this.editCompanyForm.get('companyLongitude').markAsDirty();
            }

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
    this.location = {
      latitude: undefined,
      longitude: undefined
    };
  }

  getCompanyDetails(segmentName: string): void {
    this.errorMsg = undefined;

    if (this.empPosition === 'admin') {
      this.companyService.getAllCompanyDetails()
      .subscribe(
        (companies) => {
          this.companies = [];
          this.companies = [...companies];
          this.selectedCompanyId = (this.companies.length > 0) ? this.companies[0]._id : undefined;

          if (segmentName === 'companyDetails' || segmentName === 'branchesAndPositions')
            this.onCompanyChange(segmentName);
        },
        (error) => {
          this.errorMsg = <any>error;

          this.notificationService.showErrorToast(`Error in getting the details of companies.`, 2000, 'top');
        }
      );
    } else if (this.empPosition === 'company_admin') {
      this.employeeService.getEmployeeDetailsById(secureStorage.getItem('empId')).subscribe(
        (employee) => {
          this.companies = [];
          this.companies.push(<Company>employee.companyId);
          this.selectedCompanyId = (this.companies.length > 0) ? this.companies[0]._id : undefined;

          this.addBranchForm.patchValue({
            companyId: employee.companyId['_id']
          });

          if (segmentName === 'companyDetails' || segmentName === 'branchesAndPositions')
            this.onCompanyChange(segmentName);
        },
        (error) => {
          this.errorMsg = <any>error;

          this.notificationService.showErrorToast(`Error in getting the company details.`, 2000, 'top');
        }
      );
    }
  }

  onCompanyChange(mode: 'companyDetails' | 'branchesAndPositions'): void {
    this.selectedCompanyIndex = this.companies.map((company) => company._id)
    .indexOf(this.selectedCompanyId);

    if (mode === 'companyDetails') {
      this.editCompanyForm.patchValue({
        companyName: this.companies[this.selectedCompanyIndex]?.companyName,
        companyAddress: this.companies[this.selectedCompanyIndex]?.companyAddress,
        companyLatitude: this.companies[this.selectedCompanyIndex]?.companyLocation.latitude,
        companyLongitude: this.companies[this.selectedCompanyIndex]?.companyLocation.longitude
      });

      this.googleMapsURL = this.locationService.getGoogleMapsURLForCoordinates(
        constants.googleMapsQueryURL,
        {
          latitude: this.sharedFunctions.roundTo4Decimals(this.companies[this.selectedCompanyIndex]?.companyLocation['latitude']),
          longitude: this.sharedFunctions.roundTo4Decimals(this.companies[this.selectedCompanyIndex]?.companyLocation['longitude'])
        }
      );
    }
  }

  onCompanyLocationChange(): void {
    let formLatitude: AbstractControl = this.editCompanyForm.get('companyLatitude');
    let formLongitude: AbstractControl = this.editCompanyForm.get('companyLongitude');

    if (formLatitude.valid && formLongitude.valid) {
      this.googleMapsURL = this.locationService.getGoogleMapsURLForCoordinates(
        constants.googleMapsQueryURL,
        {
          latitude: formLatitude.value,
          longitude: formLongitude.value
        }
      );
    }
  }

  addCompany(): void {
    this.errorMsg = undefined;

    if (this.addCompanyForm.valid && this.location.latitude !== undefined && this.location.longitude !== undefined) {
      let formValue: any = this.addCompanyForm.value;

      let companyDetails: Company = {
        companyName: formValue['companyName'].trim(),
        companyAddress: formValue['companyAddress'].trim(),
        companyLocation: {
          latitude: this.location.latitude,
          longitude: this.location.longitude
        },
        positions: ['company_admin', 'branch_manager'],
        branches: []
      };

      let branchDetails: CompanyBranch = {
        branchName: formValue['branchName'].trim(),
        branchAddress: formValue['companyAddress'].trim(),
        branchLocation: {
          latitude: this.location.latitude,
          longitude: this.location.longitude
        },
        companyId: ""
      };

      let loader = this.notificationService.createLoader('Adding company details...');
      loader.then((response) => response.present())
      .catch((error) => console.error("Error in present the loader:", error));

      loader.then((response) => response.dismiss())
      .catch((error) => console.error("Error in dismissing the loader:", error));

      this.companyService.addCompanyToDb(companyDetails)
      .subscribe(
        (company) => {
          branchDetails['companyId'] = company._id;

          this.branchService.addBranchToDb(branchDetails)
          .subscribe(
            (branch) => {
              this.companyService.addBranchIdToCompany(branch._id, company._id).subscribe(
                (company) => {
                  loader.then((response) => response.dismiss())
                  .catch((error) => console.error("Error in dismissing the loader:", error));

                  this.resetMapAndGpsCoords();
                  this.addCompanyForm.reset();

                  this.notificationService.showToast('Company details added successfully.', 2000, 'top');
                },
                (error) => {
                  this.errorMsg = <any>error;

                  loader.then((response) => response.dismiss())
                  .catch((error) => console.error("Error in present the loader:", error));

                  this.notificationService.showErrorToast('Error in adding branch details to the company.', 2000, 'top');
                }
              )
            },
            (error) => {
              this.errorMsg = <any>error;

              loader.then((response) => response.dismiss())
              .catch((error) => console.error("Error in present the loader:", error));

              this.notificationService.showErrorToast("Error in adding the branch details.", 2000, 'top');
            }
          );
        },
        (error) => {
          this.errorMsg = <any>error;

          loader.then((response) => response.dismiss())
          .catch((error) => console.error("Error in present the loader:", error));

          this.notificationService.showErrorToast('Error in adding company details.', 2000, 'top');
        }
      );
    } else {
      this.notificationService.createAlert('Location not available', "Kindly get your company's location.", ['OK'])
      .then(
        (alert) => alert.present()
      );
    }
  }

  addBranch(): void {
    if (this.addBranchForm.valid && this.location.latitude !== undefined && this.location.longitude !== undefined) {
      this.addBranchForm.get('companyId').enable();

      let branchDetails: CompanyBranch = Object.assign({}, this.addBranchForm.value);

      branchDetails['branchLocation'] = {
        latitude: this.location.latitude,
        longitude: this.location.longitude
      };

      let loader = this.notificationService.createLoader('Adding branch details...');
      loader.then((response) => response.present())
      .catch((error) => console.error("Error in present the loader:", error));

      this.branchService.addBranchToDb(branchDetails)
      .subscribe(
        (branch) => {
          this.companyService.addBranchIdToCompany(branch._id, branch.companyId['_id']).subscribe(
            (company) => {
              loader.then((response) => response.dismiss())
              .catch((error) => console.error('Error in dismissing the loader:', error));

              this.resetMapAndGpsCoords();
              this.addBranchForm.reset();

              this.notificationService.showToast('Branch details added successfully.', 2000, 'top');
            },
            (error) => {
              this.errorMsg = <any>error;

              loader.then((response) => response.dismiss())
              .catch((error) => console.error("Error in present the loader:", error));

              this.notificationService.showErrorToast('Error in adding branch details to the company.', 2000, 'top');
            }
          );
        },
        (error) => {
          this.errorMsg = <any>error;

          loader.then((response) => response.dismiss())
          .catch((error) => console.error("Error in present the loader:", error));

          this.notificationService.showErrorToast('Error in adding branch details.', 2000, 'top');
        }
      );
    } else {
      this.notificationService.createAlert('Location not received.', 'Make sure to get your current location to proceed.', ['OK'])
      .then(
        (alert) => alert.present()
      );
    }
  }

  editCompanyDetails(): void {
    this.errorMsg = undefined;

    let companyId = this.selectedCompanyId;
    let changes = {};

    Object.keys(this.editCompanyForm.controls).forEach((controlName) => {
      let formControl = this.editCompanyForm.controls[controlName];

      if (formControl.dirty) {
        if (controlName === 'companyLatitude' || controlName === 'companyLongitude') {

          let coordName = controlName.split("ny")[1].toLowerCase();
          changes['companyLocation.' + coordName] = this.sharedFunctions.roundTo4Decimals(formControl.value);

        } else {
          changes[controlName] = formControl.value;
        }
      }
    });

    console.log(companyId, changes);

    let loader = this.notificationService.createLoader('Updating details of ' + this.companies[this.selectedCompanyIndex]?.companyName + '...');
    loader.then((response) => response.present())
    .catch((error) => console.error('Error in present the loader:', error));

    this.companyService.updateCompanyDetailsById(companyId, changes)
    .subscribe(
      (company) => {
        this.companies[this.selectedCompanyIndex] = company;

        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showToast('Company details updated successfully.', 2000, 'top');
      },
      (error) => {
        this.errorMsg = <any>error;

        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showErrorToast('Error in updating company details.', 2000, 'top');
      }
    );
  }

  resetFormToNullValues(formName: string): void {
    if (formName === "addCompanyForm") {
      this.addCompanyForm.reset();
    } else if (formName === "addBranchForm") {
      this.addBranchForm.reset();
    }
  }

  resetEditCompanyFormToOldValues(): void {
    this.resetMapAndGpsCoords();

    this.editCompanyForm.reset({
      companyName: this.companies[this.selectedCompanyIndex].companyName,
      companyAddress: this.companies[this.selectedCompanyIndex].companyAddress,
      companyLatitude: this.companies[this.selectedCompanyIndex].companyLocation.latitude,
      companyLongitude: this.companies[this.selectedCompanyIndex].companyLocation.longitude
    });

    this.googleMapsURL = this.locationService.getGoogleMapsURLForCoordinates(
      constants.googleMapsQueryURL,
      this.companies[this.selectedCompanyIndex].companyLocation
    );
  }

  openEditModal(dataToEdit: string, index: number): void {
    let data = {
      dataIndex: index
    };

    if (dataToEdit === 'branch') {
      data['inputData'] = this.companies[this.selectedCompanyIndex].branches;
      data['isBranchEditMode'] = true;

    } else if (dataToEdit === 'position') {
      data['inputData'] = [this.companies[this.selectedCompanyIndex]];
      data['isBranchEditMode'] = false;
    }

    let modal = this.notificationService.createModal(EditBranchesAndPositionsPage, true, data);

    modal.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the modal:', error));

    modal.then((response) => {
      response.onDidDismiss()
      .then((response) => {
        let receivedData = response?.data?.updatedData;

        if (receivedData) {
          if (dataToEdit === 'branch') {
            this.companies[this.selectedCompanyIndex].branches[index] = receivedData;

          } else {
            this.companies[this.selectedCompanyIndex].positions = receivedData;
          }
        }
      })
      .catch((error) => console.error('Error in getting the modal response after dismiss:', error));
    })
    .catch((error) => console.error('Error in getting the modal response after dismiss:', error));
  }

  addNewEmployeePosition(): void {
    let newPosition = this.newPosition.trim();
    let positionRegex = new RegExp(/^[a-z_]*$/);
    let positionIndex = this.companies[this.selectedCompanyIndex].positions.indexOf(newPosition);

    if (newPosition.length > 0 && positionRegex.test(newPosition)) {
      if (newPosition != 'admin') {
        if (positionIndex === -1) {
          let loader = this.notificationService.createLoader('Adding new employee position...');

          loader.then((response) => response.present())
          .catch((error) => console.error('Error in presenting the loader:', error));

          this.companyService.addANewPositionByCompanyId(
            this.companies[this.selectedCompanyIndex]._id,
            newPosition
          ).subscribe(
            (updatedPositions) => {
              this.newPosition = undefined;

              this.companies[this.selectedCompanyIndex].positions = updatedPositions;

              loader.then((response) => response.dismiss())
              .catch((error) => console.error('Error in dismissing the loader:', error));

              this.notificationService.showToast(`Position '${newPosition}' added successfully.`, 2000, 'top');
            },
            (error) => {
              this.errorMsg = <any>error;

              loader.then((response) => response.dismiss())
              .catch((error) => console.error('Error in dismissing the loader:', error));

              this.notificationService.showErrorToast('Error in adding the employee position. Kindly try again.', 2000, 'top');
            }
          );

        } else {
          this.notificationService.showErrorToast('Position already exists.', 2000, 'top');
        }

      } else {
        this.notificationService.showErrorToast(`'${newPosition}' position is reserved. Kindly enter different position.`, 2000, 'top');
      }

    } else {
      this.notificationService.showErrorToast('Please enter a valid position name. Only use lowercase characters & underscores.', 2000, 'top');
    }
  }

  deletionConfirmation(dataToDelete: string, index: number): void {
    let alert = this.notificationService.createAlert(`Delete ${dataToDelete}?`, `Do you really want to delete the ${dataToDelete} ${
      (dataToDelete === 'branch') ?
      `'${
        this.companies[this.selectedCompanyIndex].branches[index].branchName
      }'?. All the records of branch employees will also be deleted.` :
      `'${
        this.companies[this.selectedCompanyIndex].positions[index]
      }'?`
    }`, [
      {
        text: 'NO',
        role: 'cancel'
      },
      {
        text: 'YES',
        handler: () => (dataToDelete === 'branch') ? this.deleteBranch(index) : this.deletePosition(index)
      }
    ]);

    alert.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the alert:', error));
  }

  deleteBranch(index: number): void {
    let selectedBranch: CompanyBranch = this.companies[this.selectedCompanyIndex].branches[index];

    let loader = this.notificationService.createLoader(`Deleting branch '${selectedBranch.branchName}'...`);

    loader.then((response) => response.present())
    .catch((error) => console.error('Error in present the loader:', error));

    this.branchService.deleteBranchById(selectedBranch._id).subscribe(
      (updatedBranch) => {
        this.companies[this.selectedCompanyIndex].branches.splice(index, 1);

        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showToast(`Branch '${selectedBranch.branchName}' and it's associated record(s) have been deleted successfully.`, 2000, 'top');
      },
      (error) => {
        this.errorMsg = <any>error;

        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showErrorToast('Error in deleting the branch. Kindly try again.', 2000, 'top');
      }
    );
  }

  deletePosition(positionIndex: number): void {
    let selectedCompany: Company = this.companies[this.selectedCompanyIndex];

    let positionName = selectedCompany.positions[positionIndex];

    let loader = this.notificationService.createLoader(`Deleting the position '${positionName}'...`);

    loader.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the loader:', error));

    this.employeeService.getEmployeesByCompanyId(selectedCompany._id, `?position=${selectedCompany.positions[positionIndex]}`)
    .subscribe(
      (employees) => {
        if (employees.length === 0) {

          this.companyService.deleteAPositionByCompanyId(
            this.companies[this.selectedCompanyIndex]._id,
            positionName
          ).subscribe(
            (updatedPositions) => {
              this.companies[this.selectedCompanyIndex].positions = updatedPositions;

              loader.then((response) => response.dismiss())
              .catch((error) => console.error('Error in dismissing the loader:', error));

              this.notificationService.showToast(`Position '${positionName}' deleted successfully.`, 2000, 'top');
            },
            (error) => {
              this.errorMsg = <any>error;

              loader.then((response) => response.dismiss())
              .catch((error) => console.error('Error in dismissing the loader:', error));

              this.notificationService.showErrorToast('Error in deleting the employee position. Kindly try again.', 2000, 'top');
            }
          );

        } else {
          loader.then((response) => response.dismiss())
          .catch((error) => console.error('Error in dismissing the loader:', error));

          this.notificationService.showErrorToast(`Position cannot be deleted as your company has ${employees.length} employee(s) with '${selectedCompany.positions[positionIndex]}' as their position.`, 2000, 'top');
        }
      },
      (error) => {
        this.errorMsg = <any>error;

        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showErrorToast('Error in deleting the position. Kindly try again.', 2000, 'top');
      }
    );
  }
}
