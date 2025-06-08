import { LocationService } from './../services/location/location.service';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import Attendance from '../shared/models/attendance.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-attendance-map',
  templateUrl: './attendance-map.page.html',
  styleUrls: ['./attendance-map.page.scss'],
})
export class AttendanceMapPage {

  private mapElement: ElementRef<HTMLDivElement>;

  @Input() attendance: Attendance;
  leafletMap: any;

  @ViewChild('mapElement', { static: false }) set content(content: ElementRef) {
    if (content) {
      this.mapElement = content;
    }
  }

  constructor(
    private locationService: LocationService,
    private modalCtrl: ModalController,
    private datePipe: DatePipe
  ) { }

  ionViewWillEnter(): void {
    this.showMap();
  }

  ionViewWillLeave(): void {
    this.leafletMap = undefined;
  }

  dismissModal(): void {
    this.leafletMap = undefined;
    this.modalCtrl.dismiss();
  }

  showMap(): void {
    let coordinates: { latitude: number, longitude: number, createdAt: string }[] = [];

    if (this.attendance.locationHistory.length)
      coordinates = [...this.attendance.locationHistory];

    let location: {
      latitude: number,
      longitude: number,
      createdAt: string
    };

    location = {
      latitude: this.attendance.punchInLocation.latitude,
      longitude: this.attendance.punchInLocation.longitude,
      createdAt: new Date(this.attendance.inTime).toISOString()
    };

    coordinates.unshift(location);

    if (this.attendance.punchOutLocation) {
      location = {
        latitude: this.attendance.punchOutLocation.latitude,
        longitude: this.attendance.punchOutLocation.longitude,
        createdAt: new Date(this.attendance.outTime).toISOString()
      };

      coordinates.push(location);
    }

    this.leafletMap = this.locationService.createLeafletMap(
      this.mapElement.nativeElement,
      this.attendance.punchInLocation
    );

    coordinates.forEach((coordinate, idx) => {
      if ((idx === 0) || (idx === coordinates.length - 1)) {
        this.locationService.addMarkerInLeafletMap(
          this.leafletMap,
          coordinate,
          `Signed ${
            (idx === 0) ? 'in' : 'out'
          } at: ${this.datePipe.transform(coordinate['createdAt'], 'MMM d, y hh:mm:ss a')}`
        );

      } else {
        this.locationService.addMarkerInLeafletMap(
          this.leafletMap,
          coordinate,
          this.datePipe.transform(coordinate['createdAt'], 'MMM d, y hh:mm:ss a')
        );
      }

      if (idx < coordinates.length - 1) {
        this.locationService.addSinglePolylineToLeafletMap(
          this.leafletMap,
          location,
          coordinates[idx + 1],
          `Path #${idx + 1}`
        );
      }
    });
  }

}
