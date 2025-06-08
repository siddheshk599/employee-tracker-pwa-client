import { AttendanceDetailPage } from './attendance-detail/attendance-detail.page';
import { EmployeeManagerAuthGuardService } from './services/employee-manager-auth-guard/employee-manager-auth-guard.service';
import { ChatReceiversPage } from './chat-receivers/chat-receivers.page';
import { AttendanceMapPage } from './attendance-map/attendance-map.page';
import { EditBranchesAndPositionsPage } from './edit-branches-and-positions/edit-branches-and-positions.page';
import { BranchService } from './services/branch/branch.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { constants } from './shared/constants';
import { LocationService } from './services/location/location.service';
import { FileOperationsService } from './services/file-operations/file-operations.service';
import { EmployeeService } from './services/employee/employee.service';
import { NotificationService } from './services/notification/notification.service';
import { ProcessHttpMsgService } from './services/process-http-msg/process-http-msg.service';
import { AuthService } from './services/auth/auth.service';
import { InterceptorService } from './services/interceptor/interceptor.service';
import { AuthGuardService } from './services/auth-guard/auth-guard.service';
import { AdminAuthGuardService } from './services/admin-auth-guard/admin-auth-guard.service';
import { AttendanceService } from './services/attendance/attendance.service';
import { LeaveService } from './services/leave/leave.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation/ngx';
import { NgxPaginationModule } from 'ngx-pagination';
import { DatePipe } from '@angular/common';
import { AdminManagerAuthGuardService } from './services/admin-manager-auth-guard/admin-manager-auth-guard.service';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { ChatService } from './services/chat/chat.service';
import { SalaryAdvanceService } from './services/salary-advance/salary-advance.service';
import { SalarySlipPage } from './salary-slip/salary-slip.page';
import { StatementPage } from './statement/statement.page';
import { AnalyticsService } from './services/analytics/analytics.service';
import { ForegroundService } from '@awesome-cordova-plugins/foreground-service/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';

@NgModule({
  declarations: [
    AppComponent,
    EditBranchesAndPositionsPage,
    AttendanceMapPage,
    ChatReceiversPage,
    SalarySlipPage,
    AttendanceDetailPage,
    StatementPage
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NgxPaginationModule
  ],
  providers: [{
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },
    StatusBar,
    SplashScreen,
    BackgroundGeolocation,
    Geolocation,
    LocationAccuracy,
    ForegroundService,
    BackgroundMode,
    AndroidPermissions,
    Camera,
    File,
    LocationService,
    LocationAccuracy,
    Network,
    NativeGeocoder,
    FileOperationsService,
    EmployeeService,
    AttendanceService,
    LeaveService,
    AuthService,
    NotificationService,
    ProcessHttpMsgService,
    AuthGuardService,
    AdminAuthGuardService,
    AdminManagerAuthGuardService,
    EmployeeManagerAuthGuardService,
    BranchService,
    ChatService,
    SalaryAdvanceService,
    AnalyticsService,
    DatePipe,
    { provide: 'baseUrl', useValue: constants.apiBaseURL },
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
