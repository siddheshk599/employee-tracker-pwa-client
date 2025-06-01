import { CompanyService } from './../services/company/company.service';
import { BranchService } from './../services/branch/branch.service';
import { constants } from './../shared/constants';
import { LocationService } from './../services/location/location.service';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { functions } from '../shared/functions';
import { validationMessages, formErrors } from '../shared/formValidation';
import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { NotificationService } from '../services/notification/notification.service';

@Component({
  selector: 'app-position',
  templateUrl: './edit-branches-and-positions.page.html',
  styleUrls: ['./edit-branches-and-positions.page.scss'],
})
export class EditBranchesAndPositionsPage implements OnInit {

  @Input() inputData: any[];
  @Input() dataIndex: number;
  @Input() isBranchEditMode: boolean;

  errorMsg: any;
  locationAddress: string;
  googleMapsURL: SafeResourceUrl;
  editBranchForm: FormGroup;
  newPosition: string;

  formErrors = formErrors;
  validationMessages = validationMessages;
  sharedFunctions = functions;
  branchLocation: { latitude: number, longitude: number } = {
    latitude: undefined,
    longitude: undefined
  };

  constructor(
    private domSanitizer: DomSanitizer,
    private modalCtrl: ModalController,
    private branchService: BranchService,
    private locationService: LocationService,
    private companyService: CompanyService,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.createForm();

    this.googleMapsURL = (this.isBranchEditMode) ? this.domSanitizer.bypassSecurityTrustResourceUrl(constants.indiaMapURL) : undefined;
  }

  ionViewWillEnter(): void {
    this.initialConfig(this.isBranchEditMode);
  }

  ionViewWillLeave(): void {
    this.errorMsg = undefined;
    this.branchLocation = {
      latitude: undefined,
      longitude: undefined
    };
  }

  dismissModal(): void {
    this.modalCtrl.dismiss();
  }

  initialConfig(isBranchEditMode: boolean): void {
    if (isBranchEditMode) {
      let latitude = this.inputData[this.dataIndex].branchLocation.latitude;
      let longitude = this.inputData[this.dataIndex].branchLocation.longitude;

      this.editBranchForm.patchValue({
        branchName: this.inputData[this.dataIndex].branchName,
        branchAddress: this.inputData[this.dataIndex].branchAddress,
        branchLatitude: latitude,
        branchLongitude: longitude
      });

      this.googleMapsURL = this.locationService.getGoogleMapsURLForCoordinates(
        constants.googleMapsQueryURL,
        {
          latitude: latitude,
          longitude: longitude
        }
      );

    } else {
      this.newPosition = this.inputData[0].positions[this.dataIndex];
    }
  }

  createForm(): void {
    this.editBranchForm = this.formBuilder.group({
      branchName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50), Validators.pattern(/[A-Za-z]+[0-9\.\,\/\s]*/g)]],

      branchAddress: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(100), Validators.pattern(/[A-Za-z]+[0-9\.\,\/\s]*/g)]],

      branchLatitude: ['', Validators.required],

      branchLongitude: ['', Validators.required]
    });

    this.editBranchForm.valueChanges.subscribe((data) => this.onEditBranchFormValueChanged(data));

    this.onEditBranchFormValueChanged();
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

  getLocation(): void {
    this.locationService.checkAndEnableGps();
    this.branchLocation = {
      latitude: this.locationService.latitude,
      longitude: this.locationService.longitude
    };

    let loader = this.notificationService.createLoader('Getting your current location...', true);
    loader.then((response) => response.present())
    .catch((error) => console.error("Error in getting location: ", error));

    if (this.branchLocation.latitude !== undefined && this.branchLocation.longitude !== undefined) {
      this.branchLocation = {
        latitude: this.sharedFunctions.roundTo4Decimals(this.branchLocation.latitude),
        longitude: this.sharedFunctions.roundTo4Decimals(this.branchLocation.longitude)
      };

      this.editBranchForm.patchValue({
        branchLatitude: this.branchLocation.latitude,
        branchLongitude: this.branchLocation.longitude
      });

      this.editBranchForm.get('branchLatitude').markAsDirty();
      this.editBranchForm.get('branchLongitude').markAsDirty();

      this.googleMapsURL = this.locationService.getGoogleMapsURLForCoordinates(
        constants.googleMapsQueryURL,
        this.branchLocation
      );
    }

    loader.then((response) => response.dismiss())
    .catch((error) => console.error("Error in dismissing loader: ", error));
  }

  getLocationByAddress(): void {
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

          if (result != undefined && result !== null) {
            this.branchLocation = {
              latitude: this.sharedFunctions.roundTo4Decimals(result[0].latitude),
              longitude: this.sharedFunctions.roundTo4Decimals(result[0].longitude)
            };

            this.editBranchForm.patchValue({
              branchLatitude: this.branchLocation.latitude,
              branchLongitude: this.branchLocation.longitude
            });

            this.editBranchForm.get('branchLatitude').markAsDirty();
            this.editBranchForm.get('branchLongitude').markAsDirty();

            this.googleMapsURL = this.locationService.getGoogleMapsURLForCoordinates(
              constants.googleMapsQueryURL,
              this.branchLocation
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

  onBranchLocationChange(): void {
    let formLatitude: AbstractControl = this.editBranchForm.get('branchLatitude');
    let formLongitude: AbstractControl = this.editBranchForm.get('branchLongitude');

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

  editBranchDetails(): void {
    this.errorMsg = undefined;

    let branchId = this.inputData[this.dataIndex]._id;
    let changes = {};

    Object.keys(this.editBranchForm.controls).forEach((controlName) => {
      let formControl = this.editBranchForm.controls[controlName];

      if (formControl.dirty) {
        if (controlName === 'branchLatitude' || controlName === 'branchLongitude') {

          let coordName = controlName.split("ch")[1].toLowerCase();
          changes['branchLocation.' + coordName] = formControl.value;

        } else {
          changes[controlName] = formControl.value;
        }
      }
    });

    let loader = this.notificationService.createLoader(`Updating details of '${this.inputData[this.dataIndex].branchName}...`);
    loader.then((response) => response.present())
    .catch((error) => console.error('Error in present the loader:', error));

    this.branchService.updateBranchById(branchId, changes)
    .subscribe(
      (updatedBranch) => {
        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showToast('Branch details updated successfully.', 2000, 'top');

        this.modalCtrl.dismiss({
          updatedData: updatedBranch
        });
      },
      (error) => {
        this.errorMsg = <any>error;

        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showErrorToast('Error in updating branch details.', 2000, 'top');
      }
    );
  }

  resetEditBranchFormToOldValues(): void {
    let latitude = this.inputData[this.dataIndex].branchLocation.latitude;
    let longitude = this.inputData[this.dataIndex].branchLocation.longitude;

    this.editBranchForm.reset({
      branchName: this.inputData[this.dataIndex].branchName,
      branchAddress: this.inputData[this.dataIndex].branchAddress,
      branchLatitude: latitude,
      branchLongitude: longitude
    });

    this.locationService.getGoogleMapsURLForCoordinates(
      constants.googleMapsQueryURL,
      {
        latitude: latitude,
        longitude: longitude
      }
    );
  }

  editPosition(): void {
    let newPosition = this.newPosition.trim();
    let positionRegex = new RegExp(/^[a-z_]*$/);

    if (newPosition.length > 0 && positionRegex.test(newPosition)) {
      if (newPosition != 'admin') {
        if (this.inputData[0].positions.indexOf(newPosition) === -1) {
          let loader = this.notificationService.createLoader(`Updating the position name to '${newPosition}'...`);

          loader.then((response) => response.present())
          .catch((error) => console.error('Error in presenting the loader:', error));

          this.companyService.updateAPositionByCompanyId(this.inputData[0]._id, newPosition, this.dataIndex).subscribe(
            (updatedPositions) => {
              loader.then((response) => response.dismiss())
              .catch((error) => console.error('Error in dismissing the loader:', error));

              this.notificationService.showToast(`Position name updated successfully to '${newPosition}'.`, 2000, 'top');

              this.modalCtrl.dismiss({
                updatedData: updatedPositions
              });
            },
            (error) => {
              this.errorMsg = <any>error;

              loader.then((response) => response.dismiss())
              .catch((error) => console.error('Error in dismissing the loader:', error));

              this.notificationService.showErrorToast('Error in updating the position.', 2000, 'top');
            }
          );

        } else {
          this.notificationService.showErrorToast('Position already exists. Kindly enter a different position name.', 2000, 'top');
        }

      } else {
        this.notificationService.showErrorToast(`'${newPosition}' position is reserved. Kindly enter different position.`, 2000, 'top');
      }

    } else {
      this.notificationService.showErrorToast('Please enter a valid position name. Only use lowercase characters & underscores.', 2000, 'top');
    }
  }

}
