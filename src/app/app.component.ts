import { functions } from 'src/app/shared/functions';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Component } from '@angular/core';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationEvents, BackgroundGeolocationLocationProvider } from '@ionic-native/background-geolocation/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ModalController, Platform } from '@ionic/angular';
import { merge, Observable, Observer, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { NoInternetPage } from './no-internet/no-internet.page';
import { AuthService } from './services/auth/auth.service';
import { NotificationService } from './services/notification/notification.service';
import { secureStorage } from './shared/storage';
import { Network } from '@awesome-cordova-plugins/network/ngx';

declare var window;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  sharedFunctions = functions;
  networkConnectionSubscription: Subscription;
  networkDisconnectionSubscription: Subscription;
  noInternetModal: Promise<HTMLIonModalElement>;

  constructor(
    private authService: AuthService,
    private network: Network,
    private modalCtrl: ModalController,
    private notificationService: NotificationService,
    private platform: Platform,
    private statusBar: StatusBar,
    private bgGeolocation: BackgroundGeolocation,
    private splashScreen: SplashScreen
  ) {
    this.initializeApp();

    if (this.platform.is('android'))
      this.initialBgGpsConfig();

    let loggedIn = eval(secureStorage.getItem('loggedIn'));
    if (loggedIn === null)
      secureStorage.setItem('loggedIn', 'false');

    this.checkOnlineStatus();

      // this.onlineStatus().subscribe(
    //   (isOnline) => {
    //     let modal;

    //     if (!isOnline) {
    //       modal = this.notificationService.createModal(NoInternetPage);

    //       modal.then((response) => response.present())
    //       .catch((error) => console.log("Unable to present the modal:", error));
    //     } else {
    //       this.modalCtrl.getTop().then(
    //         (modalPresent) => {
    //           if (modalPresent) {
    //             this.notificationService.showToast('Internet Connection restored.', 2000, 'top');

    //             this.modalCtrl.dismiss();
    //           }
    //         },
    //         (error) => console.log("Unable to get the modal status:", error)
    //       );
    //     }
    //   }
    // );
  }

  initializeApp(): void {
    this.platform.ready().then(() => {
      this.statusBar.styleBlackOpaque();
      this.splashScreen.hide();
    });

    this.platform.backButton.subscribeWithPriority(10, () => {
      let alert = this.notificationService.createAlert('Confirm exit', 'Do you really want to exit the app?', [
        {
          text: 'NO',
          role: 'cancel'
        },
        {
          text: 'YES',
          handler: () => navigator['app'].exitApp()
        }
      ]);

      alert.then((response) => response.present())
      .catch((error) => console.error('Error in presenting the alert:', error));
    });
  }

  initialBgGpsConfig(): void {
    let bgGpsConfig: BackgroundGeolocationConfig = {
      locationProvider: BackgroundGeolocationLocationProvider.DISTANCE_FILTER_PROVIDER,
      desiredAccuracy: 10,
      stationaryRadius: 20,
      distanceFilter: 30,
      notificationsEnabled: false,
      stopOnTerminate: false,
      interval: 1000
    };

    this.bgGeolocation.configure(bgGpsConfig)
    .then(() => {
      this.bgGeolocation.on(BackgroundGeolocationEvents.location).subscribe(
        (location) => {
          let coords = {
            latitude: this.sharedFunctions.roundTo4Decimals(location.latitude),
            longitude: this.sharedFunctions.roundTo4Decimals(location.longitude)
          };
          secureStorage.setItem('bgLocation', coords);
        },
        (error) => console.log('Error in getting background GPS location:', error)
      );
    });

    window.app = this;
  }

  checkOnlineStatus(): any {
    this.networkConnectionSubscription = this.network.onConnect().subscribe(
      () => {
        if (this.noInternetModal) {
          this.noInternetModal
          .then((response) => response.dismiss())
          .catch((error) => console.error('Error in dismissing the modal:', error));

          this.noInternetModal = undefined;
        }
      },
      (error) => console.error('Error in checking the network connection status:', error)
    );

    this.networkDisconnectionSubscription = this.network.onDisconnect()
    .subscribe(
      () => {
        if (!this.noInternetModal) {
          this.noInternetModal = this.notificationService.createModal(NoInternetPage, false);

          this.noInternetModal
          .then((response) => response.present())
          .catch((error) => console.error('Error in presenting the alert:', error));
        }
      },
      (error) => console.error('Error in checking the network disconnection status:', error)
    );

    // return merge<boolean>(
    //   fromEvent(window, 'offline').pipe(map(() => false)),
    //   fromEvent(window, 'online').pipe(map(() => true)),
    //   new Observable((sub: Observer<boolean>) => {
    //     sub.next(navigator.onLine);
    //     sub.complete();
    //   })
    // );
  }

  logOut(): void {
    this.authService.logOut();
  }

}
