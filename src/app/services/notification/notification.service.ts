import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) { }

  async showToast(message: string, duration: number, position, buttons?: any[]): Promise<void> {
    let toast;

    if (buttons) {
      toast = await this.toastCtrl.create({
        message: message,
        position: position,
        buttons: buttons,
        color: 'primary',
        mode: 'ios',
        animated: true,
        cssClass: 'custom-font'
      });
    } else {
      toast = await this.toastCtrl.create({
        message: message,
        duration: duration,
        position: position,
        color: 'primary',
        mode: 'ios',
        animated: true,
        cssClass: 'custom-font'
      });
    }

    toast.present();
  }

  async showErrorToast(message: string, duration: number, position, buttons?: any[]): Promise<void> {
    let toast;

    if (buttons) {
      toast = await this.toastCtrl.create({
        message: message,
        duration: duration,
        position: position,
        cssClass: 'custom-font',
        color: 'danger',
        buttons: buttons
      });
    } else {
      toast = await this.toastCtrl.create({
        message: message,
        duration: duration,
        position: position,
        cssClass: 'custom-font',
        color: 'danger'
      });
    }
    toast.present();
  }

  createLoader(message: string, backdrop?: boolean): Promise<HTMLIonLoadingElement> {
    return this.loadingCtrl.create({
      message: message,
      spinner: "bubbles",
      backdropDismiss: backdrop,
      keyboardClose: true,
      cssClass: 'custom-font'
    });
  }

  createAlert(header: string, message: string, buttons: any[]): Promise<HTMLIonAlertElement> {
    return this.alertCtrl.create({
      header: header,
      message: message,
      buttons: buttons,
      cssClass: 'custom-font'
    });
  }

  createModal(componentName, backdropDidDismiss: boolean, data?: any): Promise<HTMLIonModalElement> {
    let modal;
    if (!data)
      modal = this.modalCtrl.create({
        component: componentName,
        backdropDismiss: backdropDidDismiss
      });
    else
      modal = this.modalCtrl.create({
        component: componentName,
        backdropDismiss: backdropDidDismiss,
        componentProps: data
      });

    return modal;
  }
}
