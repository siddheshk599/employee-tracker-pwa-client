import { DatePipe } from '@angular/common';
import Attendance from '../shared/models/attendance.model';
import { constants } from '../shared/constants';
import { ActivatedRoute } from '@angular/router';
import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { IonSlides, Platform } from '@ionic/angular';
import { FileOperationsService } from '../services/file-operations/file-operations.service';
import { NotificationService } from '../services/notification/notification.service';
import Employee from '../shared/models/employee.model';
import { AttendanceService } from '../services/attendance/attendance.service';
import { LocationService } from '../services/location/location.service';
import { EmployeeService } from '../services/employee/employee.service';
import { Title, SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { secureStorage } from '../shared/storage';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { functions } from '../shared/functions';
import { Subscription } from 'rxjs';
import { Map, Marker } from 'leaflet';

declare var window;

@Component({
  selector: 'app-mark-attendance',
  templateUrl: './mark-attendance.page.html',
  styleUrls: ['./mark-attendance.page.scss'],
})
export class MarkAttendancePage {

  private mapElementRef: ElementRef<HTMLDivElement>;

  @ViewChild('notPunchedInSlides', { read: IonSlides }) notPunchedInSlides: IonSlides;
  @ViewChild('punchedInSlides', { read: IonSlides }) punchedInSlides: IonSlides;

  @ViewChild('mapElement', { static: false }) set content(content: ElementRef) {
    if (content) {
      this.mapElementRef = content;
    }
  }

  leafletMap: Map;
  employee: Employee;
  punchedIn: boolean;
  punchedOut: boolean;

  cameraImg: string;
  attendanceImg: string;
  inTime: any;
  errorMsg: any;

  gpsCheckInterval: any;
  empLocation: {
    latitude: number,
    longitude: number,
    createdAt?: string
  } = {
    latitude: undefined,
    longitude: undefined
  };
  isNotAtMentionedLocation: boolean = false;
  canPunchInOut: boolean = false;
  sharedFunctions = functions;

  distanceFromBranchInKM: number;
  liveTrackingHistory: {
    latitude: number,
    longitude: number,
    createdAt?: string }[] = [];
  mapMarkers: Marker<any>[] = [];
  storageEmpId: string;

  liveTrackingSubscription: Subscription;
  slideText: 'View Camera Pic' | 'View Punch-in Pic' | 'Track your location' | 'Show branch location' | 'Click your pic' = "Click your pic";
  mapsURL: string = constants.indiaMapURL;
  googleMapsURL: SafeResourceUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.mapsURL);

  constructor(
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private camera: Camera,
    private platform: Platform,
    private androidPerms: AndroidPermissions,
    private fileOpsService: FileOperationsService,
    private attendanceService: AttendanceService,
    private locationService: LocationService,
    private employeeService: EmployeeService,
    private title: Title,
    private backgroundMode: BackgroundMode,
    private domSanitizer: DomSanitizer,
    private datePipe: DatePipe,
    private changeDetector: ChangeDetectorRef
  ) {}

  ionViewWillEnter(): void {
    this.title.setTitle(`Mark Attendance - ${constants.appName}`);
    this.storageEmpId = secureStorage.getItem('empId');
    this.punchedInSlides.lockSwipes(true);
    this.notPunchedInSlides.lockSwipes(true);

    this.slideText = (
      (this.punchedIn) ? (
        (this.cameraImg) ? 'View Camera Pic' : 'View Punch-in Pic'
      ) : (
        (this.cameraImg) ? 'View Camera Pic' : 'Click your pic'
      )
    );

    if (history.state['_id']) {
      this.employee = history.state;
      this.initialConfig();
    } else {
      this.getEmployeeDetailsById(this.activatedRoute.snapshot.paramMap.get('employeeId'));
    }
  }

  ionViewWillLeave(): void {
    this.employee = undefined;
    this.punchedIn = false;
    this.punchedOut = false;
    this.canPunchInOut = false;
    this.distanceFromBranchInKM = undefined;
    this.errorMsg = undefined;
    this.attendanceImg = undefined;
  }

  initialConfig(): void {
    this.mapsURL = `${constants.googleMapsQueryURL}${this.employee.branchId['branchLocation']['latitude'].toString()},${this.employee.branchId['branchLocation']['longitude'].toString()}`;

    this.googleMapsURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.mapsURL);

    this.canPunchInOut = this.employeeService.canMarkAttendance(this.employee);

    if (this.employee.activeAttendanceId) {
      this.punchedIn = true;
      this.punchedOut = false;
      this.attendanceImg = (this.cameraImg) ? undefined : this.employee.activeAttendanceId['punchInImg'];
      this.changeDetector.detectChanges();

      if (this.liveTrackingSubscription === undefined)
        this.startLiveTracking();

      if (secureStorage.getItem('attendanceId') === null && this.employee.activeAttendanceId['_id']) {
        secureStorage.setItem('attendanceId', this.employee.activeAttendanceId['_id']);
      }
    }

    if (this.punchedIn && !this.gpsCheckInterval) {
      this.gpsCheckInterval = this.locationService.setLocationTrackingInterval();

      this.locationService.addIntervalId(this.gpsCheckInterval);
    }
  }

  getEmployeeDetailsById(empId: string): void {
    this.employee = undefined;
    this.errorMsg = undefined;

    this.employeeService.getEmployeeDetailsById(empId).subscribe(
      (employee) => {
        this.employee = employee;
        this.initialConfig();
      },
      (error) => {
        this.errorMsg = <any>error;

        this.notificationService.showErrorToast('Error in getting the details.', 2000, 'top');
      }
    );
  }

  checkCameraPermission(): void {
    if (this.platform.is('android')) {
      this.androidPerms.checkPermission(this.androidPerms.PERMISSION.CAMERA)
      .then(
        (result) => {
          if (!result.hasPermission) {
            this.androidPerms.requestPermission(this.androidPerms.PERMISSION.CAMERA)
            .then(
              (result) => this.takePicture(),
              (error) => this.notificationService.showErrorToast("Error in getting Android camera permission.", 2000, 'top')
            );
          }
        },
        (error) => this.notificationService.showToast("Error in checking Android camera permission.", 2000, 'top')
      );
    } else {
      this.takePicture();
    }
  }

  takePicture(): void {
    const cameraOptions: CameraOptions  = {
      quality: 40,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      sourceType: this.camera.PictureSourceType.CAMERA,
      cameraDirection: this.camera.Direction.FRONT,
      correctOrientation: true
    };

    this.camera.getPicture(cameraOptions).then(
      (base64URL) => {
        base64URL = 'data:image/jpeg;base64, ' + base64URL;

        this.cameraImg = base64URL;
        this.slideText = (this.punchedIn) ? 'View Camera Pic' : this.slideText;
        this.attendanceImg = undefined;

        if (!this.punchedIn) {
          this.notPunchedInSlides.getActiveIndex()
          .then((activeIndex) => {
            this.slideText = (activeIndex === 0) ? 'View Camera Pic' : 'Show branch location';
          })
          .catch((error) => console.error('Error in getting the active index of slide:', error));
        }

      },
      (error) => this.notificationService.showErrorToast("Unable to capture image. Please check your camera and allow the app to access your camera.", 2000, 'top')
    );
  }

  startLiveTracking(): void {
    let activeAttendance: Attendance = <Attendance>this.employee.activeAttendanceId;

    if (activeAttendance) {
      // If map container is not initialized
      if (this.leafletMap === undefined) {
        this.leafletMap = this.locationService.createLeafletMap(
          this.mapElementRef.nativeElement,
          activeAttendance.punchInLocation
        );
      }

      // Add location history to map
      if (this.liveTrackingHistory.length === 0) {
        this.liveTrackingHistory.push({
          latitude: activeAttendance.punchInLocation.latitude,
          longitude: activeAttendance.punchInLocation.longitude,
          createdAt: activeAttendance.inTime
        });
        this.liveTrackingHistory.push(...activeAttendance.locationHistory);
      }

      let path: [number, number][] = [];

      this.liveTrackingHistory.forEach((location, idx) => {
        let newMarker = this.locationService.addMarkerInLeafletMap(
          this.leafletMap,
          location,
          `${
            (location.createdAt) ? `${this.datePipe.transform(location.createdAt, 'MMM d, y, hh:mm:ss a')}` : `#${idx + 1}`
          }`
        );

        this.mapMarkers.push(newMarker);

        if (idx < this.liveTrackingHistory.length - 1) {
          this.locationService.addSinglePolylineToLeafletMap(
            this.leafletMap,
            location,
            this.liveTrackingHistory[idx + 1],
            `Path #${idx + 1}`
          );
        }
      });

      this.locationService.showAllMarkersInSingleView(this.leafletMap, this.mapMarkers);

      this.liveTrackingSubscription = this.locationService.watchPosition().subscribe(
        (position) => {
          if (position.coords && position.coords.latitude !== undefined && position.coords.longitude !== undefined) {

            this.empLocation = {
              latitude: this.sharedFunctions.roundTo4Decimals(position.coords.latitude),
              longitude: this.sharedFunctions.roundTo4Decimals(position.coords.longitude),
              createdAt: new Date().toISOString()
            };

            if (this.liveTrackingHistory.length > 0) {
              let lastLocation = this.liveTrackingHistory[this.liveTrackingHistory.length - 1];

              if (
                (lastLocation.latitude === this.empLocation.latitude) &&
                (lastLocation.longitude === this.empLocation.longitude)
              ) {
                this.liveTrackingHistory.pop();
              }

              this.liveTrackingHistory.push(this.empLocation);

              let newMarker = this.locationService.addMarkerInLeafletMap(
                this.leafletMap,
                this.empLocation,
                `${
                  (this.empLocation.createdAt) ? `${this.datePipe.transform(this.empLocation.createdAt, 'MMM d, y hh:mm:ss a')}` : `#${this.liveTrackingHistory.length}`
                }`
              );

              this.mapMarkers.push(newMarker);

              if (this.liveTrackingHistory.length >= 2) {
                this.locationService.addSinglePolylineToLeafletMap(
                  this.leafletMap,
                  this.liveTrackingHistory[(this.liveTrackingHistory.length - 1) - 1],
                  this.liveTrackingHistory[this.liveTrackingHistory.length - 1],
                  `Path #${(this.liveTrackingHistory.length - 1)}`
                );
              }

              this.locationService.showAllMarkersInSingleView(this.leafletMap, this.mapMarkers);
            }
          }
        },
        (error) => {
          this.notificationService.showErrorToast('Error in getting your location. Kindly allow the app to access your location and check your GPS & internet connection.', 2000, 'top');
        }
      );
    } else {
      this.notificationService.showErrorToast('No native element.', 2000, 'top');
    }
  }

  isWithinBranchLocation(): boolean {
    let isNearBranchLocation: boolean = false;
    this.distanceFromBranchInKM = undefined;
    this.isNotAtMentionedLocation = undefined;

    this.locationService.checkAndEnableGps();
    this.empLocation = {
      latitude: this.locationService.latitude,
      longitude: this.locationService.longitude
    };

    if (
      this.empLocation.latitude !== undefined &&
      this.empLocation.longitude !== undefined
    ) {
      this.empLocation = {
        latitude: this.sharedFunctions.roundTo4Decimals(this.empLocation.latitude),
        longitude: this.sharedFunctions.roundTo4Decimals(this.empLocation.longitude)
      };

      if (!this.employee.canPunchInOutAnywhere) {
        this.distanceFromBranchInKM = this.sharedFunctions.roundTo4Decimals(
          this.locationService.getDistanceBetweenTwoCoordinates(
            this.empLocation,
            this.employee.branchId['branchLocation']
          )
        );

        if (this.distanceFromBranchInKM > 0.005) {
          this.isNotAtMentionedLocation = true;

          this.notificationService.showErrorToast('You are not at the punch in location. Kindly punch in from the branch location only.', 2000, 'top');

        } else {
          isNearBranchLocation = true;
        }

      } else {
        isNearBranchLocation = true;
      }
    }

    return isNearBranchLocation;
  }

  punchIn(): void {
    let inTime = new Date(new Date().toISOString().split('T')[0] + 'T' + this.employee.inTime.split('T')[1]);

    let outTime = new Date(new Date().toISOString().split('T')[0] + 'T' + this.employee.outTime.split('T')[1]);

    let currentTime = new Date();

    // if (this.employee.activeAttendanceId && this.employee.activeAttendanceId['overtimeHours']) {
    //   outTime.setHours(
    //     outTime.getTime() +
    //     (this.employee.activeAttendanceId['overtimeHours'] *
    //     (60 * 60 * 1000))
    //   );
    // }

    let diffInMins = functions.getDiffInMins(inTime, currentTime);

    if ((diffInMins <= 30) && (currentTime <= outTime)) {

      if (this.isWithinBranchLocation()) {
        let loader = this.notificationService.createLoader("Punching in...");
        loader.then((response) => response.present())
        .catch((error) => console.error("Error in presenting the loader."));

        currentTime = new Date();

        let jobStatus = (currentTime <= inTime) ? "on-time" : "late";

        let attendanceInTime = currentTime.toISOString();
        let base64Data = this.cameraImg.split(', ')[1];

        this.fileOpsService.addAnImage(
          base64Data,
          `punchIn_${new Date().getTime()}.jpg`,
          'punchIn'
        ).subscribe(
          (attendanceImg) => {
            if (attendanceImg.success) {
              let attendance = {
                empId: this.employee._id,
                inTime: attendanceInTime,
                punchInImg: attendanceImg.imagePath,
                punchInLocation: this.empLocation,
                punchInDoneBy: (
                  (secureStorage.getItem('position') === 'branch_manager') ?
                  secureStorage.getItem('empId') :
                  this.employee._id
                ),
                status: jobStatus,
                locationHistory: []
              };

              this.attendanceService.addAttendance(attendance)
              .subscribe(
                (attendance) => {

                  this.employeeService.updateEmployeeDetailsById(this.employee._id, { nextPossiblePunchIn: "" }, '?nextPossiblePunchIn=false')
                  .subscribe(
                    (employee) => {

                      this.employeeService.updateEmployeeDetailsById(this.employee._id, {
                        activeAttendanceId: attendance._id
                      }).subscribe(
                        (employee) => {
                          loader.then((response) => response.dismiss())
                          .catch((error) => console.error("Error in dismissing the loader:", error));

                          this.employee = employee;
                          this.attendanceImg = attendanceImg.imagePath;
                          this.cameraImg = undefined;
                          this.punchedIn = true;
                          this.punchedOut = false;
                          this.changeDetector.detectChanges();

                          secureStorage.setItem('attendanceId', attendance._id);

                          this.notificationService.showToast("Punched in successfully.", 2000, 'top');

                          this.startLiveTracking();

                          if (!this.gpsCheckInterval) {
                            this.gpsCheckInterval = this.locationService.setLocationTrackingInterval();

                            this.locationService.addIntervalId(this.gpsCheckInterval);
                          }

                          if (this.platform.is('android')) {
                            this.locationService.startBgGpsMode();
                          }
                        },
                        (error) => {
                          this.errorMsg = <any>error;

                          loader.then((response) => response.dismiss())
                          .catch((error) => console.error("Error in dismissing the loader:", error));

                          this.notificationService.showErrorToast("Error in punching you in. Please try again.", 2000, 'top');
                        }
                      );
                    },
                    (error) => {
                      this.errorMsg = <any>error;

                      loader.then((response) => response.dismiss())
                      .catch((error) => console.error("Error in dismissing the loader:", error));

                      this.notificationService.showErrorToast("Error in punching you in. Please try again.", 2000, 'top');
                    }
                  );
                },
                (error) => {
                  loader.then((response) => response.dismiss())
                  .catch((error) => console.error("Error in dismissing the loader:", error));

                  this.errorMsg = <any>error;

                  this.notificationService.showErrorToast("Error in punching you in. Please try again.", 2000, 'top');
                }
              );

            } else {
              loader.then((response) => response.dismiss())
              .catch((error) => console.error("Error in dismissing the loader."));

              this.notificationService.showErrorToast('Error in uploading your punch-in image. Please try again.', 2000, 'top');
            }
          },
          (error) => {
            this.errorMsg = <any>error;

            loader.then((response) => response.dismiss())
            .catch((error) => console.error("Error in dismissing the loader."));

            this.notificationService.showErrorToast('Error in uploading your punch-in image. Please try again.', 2000, 'top');
          }
        );

      } else {
        this.notificationService.showErrorToast('Error in getting your location. Please try again.', 2000, 'top');
      }
    } else {
      this.notificationService.showErrorToast("Punch-in can be done only within 30 minutes prior to / after your in-time and before your out-time.", 2000, 'top');
    }
  }

  punchOut(): void {
    let endOfDay = new Date(`${this.employee.activeAttendanceId['inTime'].split('T')[0]}T23:59:00.000Z`);
    let currentTime = new Date();

    // if (this.employee.activeAttendanceId && this.employee.activeAttendanceId['overtimeHours']) {
    //   outTime.setHours(
    //     outTime.getTime() +
    //     (this.employee.activeAttendanceId['overtimeHours'] *
    //     (60 * 60 * 1000))
    //   );
    // }

    //if (currentTime >= outTime) {
      if (this.isWithinBranchLocation()) {

        let loader = this.notificationService.createLoader("Punching out...");
        loader.then((response) => response.present())
        .catch((error) => console.error("Error in presenting the loader."));

        let base64Data = this.cameraImg.split(', ')[1];
        this.fileOpsService.addAnImage(
          base64Data,
          `punchOut_${new Date().getTime()}.jpg`,
          'punchOut'
        ).subscribe(
          (response) => {

            if (response.success) {
              let attendance = {
                outTime: (
                  (currentTime.getTime() > endOfDay.getTime()) ? endOfDay.toISOString() : currentTime.toISOString()
                ),
                punchOutImg: response.imagePath,
                punchOutLocation: this.empLocation,
                punchOutDoneBy: (
                  (secureStorage.getItem('position') === 'branch_manager') ?
                  secureStorage.getItem('empId') :
                  this.employee._id
                )
              };

              this.attendanceService.updateAttendanceById(this.employee.activeAttendanceId['_id'], attendance)
              .subscribe(
                (attendance) => {
                  this.attendanceImg = response.imagePath;
                  this.cameraImg = undefined;

                  let nextPunchIn = new Date((new Date().toISOString()).split('T')[0] + 'T' + this.employee.inTime.split('T')[1]);

                  nextPunchIn.setDate(nextPunchIn.getDate() + 1);

                  this.employeeService.updateEmployeeDetailsById(this.employee._id, { nextPossiblePunchIn: nextPunchIn })
                  .subscribe(
                    (employee) => {

                      this.employeeService.updateEmployeeDetailsById(this.employee._id, { activeAttendanceId: "" }, '?activeAttendanceId=false').subscribe(
                        (employee) => {
                          loader.then((response) => response.dismiss())
                          .catch((error) => console.error("Error in dismissing the loader:", error));

                          this.punchedIn = false;
                          this.punchedOut = true;
                          this.leafletMap = undefined;
                          this.employee = employee;
                          this.liveTrackingHistory = [];
                          this.mapMarkers = [];

                          secureStorage.removeItem('attendanceId');
                          secureStorage.removeItem('bgLocation');
                          this.locationService.clearAllIntervals();

                          if (this.liveTrackingSubscription !== undefined)
                            this.liveTrackingSubscription.unsubscribe();

                          if (this.gpsCheckInterval)
                            clearInterval(this.gpsCheckInterval);

                          this.notificationService.showToast("Punched out successfully.", 2000, 'top');

                          if (this.platform.is('android')) {
                            this.locationService.stopBgGpsMode();
                          }

                          if (this.gpsCheckInterval)
                            clearInterval(this.gpsCheckInterval);
                        },
                        (error) => {
                          this.errorMsg = <any>error;

                          loader.then((response) => response.dismiss())
                          .catch((error) => console.error("Error in dismissing the loader:", error));

                          this.notificationService.showErrorToast("Error in updating the employee's attendance details.", 2000, 'top');
                        }
                      );
                    },
                    (error) => {
                      this.errorMsg = <any>error;

                      loader.then((response) => response.dismiss())
                      .catch((error) => console.error("Error in dismissing the loader:", error));

                      this.notificationService.showErrorToast("Error in updating the employee's attendance details.", 2000, 'top');
                    }
                  );
                },
                (error) => {
                  this.errorMsg = <any>error;

                  loader.then((response) => response.dismiss())
                  .catch((error) => console.error("Error in dismissing the loader:", error));

                  this.notificationService.showErrorToast("Error in updating the attendance details. Please try again.", 2000, 'top');
                }
              );

            } else {
              loader.then((response) => response.dismiss())
              .catch((error) => console.error("Error in dismissing the loader."));

              this.notificationService.showErrorToast('Error in uploading your punch-in image. Please try again.', 2000, 'top');
            }
          },
          (error) => {
            this.errorMsg = <any>error;

            this.notificationService.showErrorToast('Error in uploading your punch-out image. Please try again.', 2000, 'top');
          }
        );

      } else {
        this.notificationService.showErrorToast('Error in getting your location. Please try again.', 2000, 'top');
      }

    // } else {
    //   this.notificationService.showErrorToast('Kindly punch out at the given out time only.', 2000, 'top');
    // }
  }

  changeSlide(isPunchedIn: boolean): void {
    if (isPunchedIn) {
      this.punchedInSlides.isBeginning()
      .then((isStartingSlide) => {
        this.punchedInSlides.lockSwipes(false);

        if (isStartingSlide) {
          this.punchedInSlides.slideNext();
          this.slideText = "Track your location";
        } else {
          this.punchedInSlides.slidePrev();
          this.slideText = (this.cameraImg) ? "View Camera Pic" : "View Punch-in Pic";
        }

        this.punchedInSlides.lockSwipes(true);
      })
      .catch((error) => console.error('Error in changing slides:', error));

    } else {
      this.notPunchedInSlides.isBeginning()
      .then((isStartingSlide) => {
        this.notPunchedInSlides.lockSwipes(false);

        if (isStartingSlide) {
          this.notPunchedInSlides.slideNext();
          this.slideText = "Show branch location";
        } else {
          this.notPunchedInSlides.slidePrev();
          this.slideText = (this.cameraImg) ? "View Camera Pic" : "Click your pic";
        }

        this.punchedInSlides.lockSwipes(true);
      })
      .catch((error) => console.error('Error in changing slides:', error));

    }
  }
}
