import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ProcessHttpMsgService } from './../process-http-msg/process-http-msg.service';
import { Inject, Injectable, ElementRef } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Platform } from '@ionic/angular';
import { secureStorage } from 'src/app/shared/storage';
import { AttendanceService } from '../attendance/attendance.service';
import { NotificationService } from '../notification/notification.service';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { NativeGeocoder, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Map, Marker, LatLng, Polyline, tileLayer, marker, icon, featureGroup } from 'leaflet';
import { functions } from 'src/app/shared/functions';
import { ForegroundService } from '@awesome-cordova-plugins/foreground-service/ngx';

declare var window;

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  address: string = "";
  latitude: number;
  longitude: number;
  gpsCheckInterval;

  employeeLocation: {
    latitude: number,
    longitude: number
  } = {
    latitude: undefined,
    longitude: undefined
  };
  nativeGeocoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 1
  };
  sharedFunctions = functions;

  constructor(
    @Inject('baseUrl') private baseUrl,
    private http: HttpClient,
    private domSanitizer: DomSanitizer,
    private processHttpMsgService: ProcessHttpMsgService,
    private geolocation: Geolocation,
    private notificationService: NotificationService,
    private platform: Platform,
    private androidPerms: AndroidPermissions,
    private foregroundService: ForegroundService,
    private backgroundMode: BackgroundMode,
    private attendanceService: AttendanceService,
    private locationAccuracy: LocationAccuracy,
    private nativeGeocoder: NativeGeocoder
  ) {}

  checkAndEnableGps(): void {
    if (this.platform.is('android')) {
      this.androidPerms.checkPermission(this.androidPerms.PERMISSION.ACCESS_FINE_LOCATION).then(
        (result) => {
          if (result.hasPermission) {
            this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
            .then((result) => this.getGpsCoordinates())
            .catch((error) => console.error('Error in enabling GPS on Android.'));

          } else {
            this.androidPerms.requestPermission(this.androidPerms.PERMISSION.ACCESS_FINE_LOCATION)
            .then((result) => {
              if (result.hasPermission) {
                this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
                .then((result) => this.getGpsCoordinates())
                .catch((error) => console.error('Error in enabling GPS on Android.'));

              } else {
                this.notificationService.showErrorToast('Please allow the app to access your location.', 2000, 'top');
              }
            })
            .catch((error) => console.error('Error in requesting GPS permission:', error));
          }
        }
      ).catch((error) => console.error('Error in getting status of GPS permission:', error));
    } else {
      this.getGpsCoordinates();
    }
  }

  getGpsCoordinates(): void {
    this.geolocation.getCurrentPosition({
      timeout: 7000,
      maximumAge: 2000,
      enableHighAccuracy: true
    })
    .then((location) => {
      this.latitude = undefined;
      this.longitude = undefined;

      this.latitude = location.coords.latitude;
      this.longitude = location.coords.longitude;
    })
    .catch(() => {
      this.notificationService.showErrorToast("Error in getting location.\nPlease check and enable your GPS and internet connection.", 2000, 'top');
    });
  }

  watchPosition(): Observable<any> {
    return this.geolocation.watchPosition({
      timeout: 7000,
      maximumAge: 2000,
      enableHighAccuracy: true
    });
  }

  getGoogleMapsURLForCoordinates(
    googleMapsQueryURL: string,
    location: {
      latitude: number,
      longitude: number
    }
  ): SafeResourceUrl {
    let mapsURL = `${googleMapsQueryURL}
    ${this.sharedFunctions.roundTo4Decimals(location.latitude).toFixed(4)},
    ${this.sharedFunctions.roundTo4Decimals(location.longitude).toFixed(4)}`;

    let googleMapsURL = this.domSanitizer.bypassSecurityTrustResourceUrl(mapsURL);

    return googleMapsURL;
  }

  createLeafletMap(
    mapElement: HTMLDivElement,
    location: { latitude: number, longitude: number }
  ): Map {
    let leafletMap: Map = new Map(mapElement);
    this.setLeafletMapView(leafletMap, location);
    setTimeout(() => leafletMap.invalidateSize(), 500);

    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(leafletMap);

    return leafletMap;
  }

  setLeafletMapView(
    leafletMap: Map,
    location: {
      latitude: number,
      longitude: number
    },
    zoomLevel: number = 18,
  ): void {
    leafletMap.setView([
      location.latitude,
      location.longitude
    ], zoomLevel);
  }

  addMarkerInLeafletMap(
    leafletMap: Map,
    location: { latitude: number, longitude: number },
    markerPopupMsg: string,
    markerTooltipText: string = markerPopupMsg
  ): Marker<any> {
    let customMarkerIcon = icon({
      iconUrl: 'https://icon-library.com/images/google-maps-gps-icon/google-maps-gps-icon-14.jpg',
      iconSize: [32, 32],
      popupAnchor: [0, -20]
    });

    let newMarker: Marker<any> = marker([location.latitude, location.longitude], { icon: customMarkerIcon })
    .on('click', (event) => {
      newMarker.closeTooltip();

      this.setLeafletMapView(leafletMap, {
        latitude: event['latlng']['lat'],
        longitude: event['latlng']['lng']
      });
    })
    .bindTooltip(markerTooltipText)
    .bindPopup(markerPopupMsg, { autoClose: true })
    .addTo(leafletMap).openPopup();

    return newMarker;
  }

  showAllMarkersInSingleView(leafletMap: Map, markers: Marker<any>[]): void {
    let group = featureGroup(markers);
    leafletMap.fitBounds(group.getBounds());
  }

  addSinglePolylineToLeafletMap(
    leafletMap: Map,
    point1: { latitude: number, longitude: number },
    point2: { latitude: number, longitude: number },
    tooltipText: string
  ): Polyline<any> {
    let pointA = new LatLng(point1.latitude, point1.longitude);
    let pointB = new LatLng(point2.latitude, point2.longitude);

    let path = [pointA, pointB];

    let singlePolyline: Polyline<any> = new Polyline(path, {
      color: 'blue',
      weight: 2,
      opacity: 0.7,
      smoothFactor: 1
    }).bindTooltip(tooltipText).addTo(leafletMap);

    return singlePolyline;
  }

  getDistanceBetweenTwoCoordinates(
    point1: { latitude: number, longitude: number },
    point2: { latitude: number, longitude: number }
  ): number {
    let radiusOfEarthInKm = 6371;

    let x1 = point2.latitude - point1.latitude;
    let dLat = x1 * Math.PI / 180;

    let x2 = point2.longitude - point1.longitude;
    let dLon = x2 * Math.PI / 180;

    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos((point1.latitude * Math.PI / 180)) * Math.cos((point2.latitude * Math.PI / 180)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);

    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    let distance = radiusOfEarthInKm * c;

    return distance;
  }

  startBgGpsMode(): void {
    this.notificationService.showToast('Monitoring your location for the active job...', 2000, 'top');

    this.foregroundService.start('GPS Monitoring', 'Monitoring your location...');
    window.app.bgGeolocation.start();
    this.backgroundMode.enable();
    this.backgroundMode.excludeFromTaskList();
    this.backgroundMode.disableWebViewOptimizations();
  }

  stopBgGpsMode(): void {
    this.foregroundService.stop();
    window.app.bgGeolocation.stop();
    this.backgroundMode.moveToForeground()
    this.backgroundMode.disable();
  }

  getEmployeeLocation(background: boolean): { latitude: number, longitude: number } {
    if (this.platform.is('android') && background) {
      window.app.bgGeolocation.start();
      let coords = secureStorage.getItem('bgLocation');
      this.employeeLocation.latitude = coords.latitude;
      this.employeeLocation.longitude = coords.longitude;
    } else {
      this.checkAndEnableGps();
      this.employeeLocation.latitude = this.latitude;
      this.employeeLocation.longitude = this.longitude;
    }

    return this.employeeLocation;
  }

  setLocationTrackingInterval() {
    return setInterval(() => {
      let employeeLocation = this.getEmployeeLocation(true);

      if (employeeLocation.latitude !== undefined && employeeLocation.longitude !== undefined && secureStorage.getItem('attendanceId') !== null) {
        this.attendanceService.updateLocationHistory(secureStorage.getItem('attendanceId'), employeeLocation).subscribe(
          (attendance) => {},
          (error) => console.error('Error in updating location history:', error)
        );
      }
    }, 120000);
  }

  addIntervalId(id: number) {
    let intervalIds = secureStorage.getItem('intervalIds');
    if (intervalIds === null) {
      let ids: number[] = [];
      ids.push(id);
      secureStorage.setItem('intervalIds', ids);
    } else {
      intervalIds.push(id);
      secureStorage.setItem('intervalIds', intervalIds);
    }
  }

  clearAllIntervals(): void {
    let ids = secureStorage.getItem('intervalIds');
    if (ids != null) {
      for (let id of ids) {
        clearInterval(id);
      }
    }
    secureStorage.removeItem('intervalIds');
  }

  forwardGeocoding(address: string): Promise<any[]> {
    if (this.platform.is('android') || this.platform.is('ios')) {
      return this.nativeGeocoder.forwardGeocode(address, this.nativeGeocoderOptions);

    } else {
      return this.http.get<any[]>(`${this.baseUrl}/geocoding?type=forward&address=${encodeURIComponent(address)}`).pipe(catchError(this.processHttpMsgService.handleError)).toPromise();
    }
  }

  reverseGeocoding(latitude: number, longitude: number): Promise<any[]> {
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.nativeGeocoder.reverseGeocode(latitude, longitude, this.nativeGeocoderOptions);

    } else {
      return this.http.get<any[]>(`${this.baseUrl}/geocoding?type=backward&latitude=${latitude}&longitude=${longitude}`).pipe(catchError(this.processHttpMsgService.handleError)).toPromise();
    }

  }
}
