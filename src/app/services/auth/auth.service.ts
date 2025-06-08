import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationService } from '../notification/notification.service';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { catchError } from 'rxjs/operators';
import { ProcessHttpMsgService } from '../process-http-msg/process-http-msg.service';
import { secureStorage } from '../../shared/storage';
import { Platform } from '@ionic/angular';

declare var window;
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private platform: Platform,
    private notificationService: NotificationService,
    private processHttpMsgService: ProcessHttpMsgService,
    @Inject('baseUrl') private baseUrl
  ) { }

  logIn(credentials: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(this.baseUrl + '/users/login', credentials, { headers }).pipe(catchError(this.processHttpMsgService.handleError));
  }

  logOut() {
    let attendanceId = secureStorage.getItem('attendanceId');
    if (!attendanceId) {
      secureStorage.clear();
      secureStorage.setItem('loggedIn', "false");
      this.router.navigateByUrl('/login');

      if (this.platform.is('android'))
        window.app.bgGeolocation.stop();

      this.notificationService.showToast('Logged out successfully.', 2000, 'top');
    } else {
      this.notificationService.showErrorToast("You can't logout as your location is being monitored for your attendance.", 2000, 'top');
    }

  }

  setEmployeeId() {
    let empId = secureStorage.getItem("empId");
    if (empId === null) {
      let jwt = secureStorage.getItem('jwtToken');
      let decodedJwt = jwt_decode(jwt);
      secureStorage.setItem('empId', decodedJwt["_id"]);
    }
  }

  checkJwtToken() {
    this.http.get(this.baseUrl + '/users/checkJwtToken')
    .subscribe(
      (response) => {
        if (!response["success"]) {
          this.notificationService.showErrorToast('Token expired. You need to login again.', 2000, 'top');

          this.logOut();
        }
      }
    );
  }
}
