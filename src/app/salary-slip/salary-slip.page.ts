import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { File, IWriteOptions } from '@ionic-native/file/ngx';
import { NotificationService } from './../services/notification/notification.service';
import { ModalController, Platform } from '@ionic/angular';
import { Component, Input } from '@angular/core';
import Employee from '../shared/models/employee.model';
import { jsPDF } from 'jspdf';
import domtoimage from 'dom-to-image';

@Component({
  selector: 'app-salary-slip',
  templateUrl: './salary-slip.page.html',
  styleUrls: ['./salary-slip.page.scss'],
})
export class SalarySlipPage {

  @Input() employee: Employee;
  @Input() empSalaryDetails: any;
  pathToCheck: string = '';
  dirToCheck: string = '';

  constructor(
    private modalCtrl: ModalController,
    private notificationService: NotificationService,
    private platform: Platform,
    private file: File,
    private androidPerms: AndroidPermissions
  ) {}

  dismissModal(): void {
    this.modalCtrl.dismiss();
  }

  generateSalarySlipPDF(): void {
    let loader = this.notificationService.createLoader('Generating PDF...');
    loader.then((response) => response.present())
    .catch((error) => console.error('Error in presenting the loader:', error));

    let salarySlipElement: HTMLElement = document.getElementById('salarySlip');
    let outputFileName: string = `Salary_Slip_of_${this.empSalaryDetails['salaryMonth']}_${this.employee.empName}_${new Date().getTime().toString()}.pdf`;

    let pdfDocument = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    pdfDocument.html(salarySlipElement)
    .then((result) => {
      if (this.platform.is('android')) {
        this.generatePDFForAndroid(salarySlipElement, outputFileName, loader);

      } else {
        pdfDocument.save(outputFileName);

        loader.then((response) => response.dismiss())
        .catch((error) => console.error('Error in dismissing the loader:', error));

        this.notificationService.showToast(`Salary Slip has been saved as ${outputFileName} in your device.`, 2000, 'top');
      }
    })
    .catch((error) => {
      loader.then((response) => response.dismiss())
      .catch((error) => console.error('Error in dismissing the loader:', error));

      this.notificationService.showErrorToast('Error in generating the PDF of salary slip. Kindly try again after some time.', 2000, 'top');
    });

  }

  generatePDFForAndroid(salarySlipElement: HTMLElement, outputFileName: string, loader: Promise<any>): void {
    this.androidPerms.checkPermission(this.androidPerms.PERMISSION.WRITE_EXTERNAL_STORAGE).then((result) => {

      if (result.hasPermission) {
        this.writePDFToAndroid(salarySlipElement, outputFileName, loader);

      } else {
        this.androidPerms.requestPermissions([
          this.androidPerms.PERMISSION.READ_EXTERNAL_STORAGE,
          this.androidPerms.PERMISSION.WRITE_EXTERNAL_STORAGE
        ]).then((result) => {
          if (result.hasPermission) {
            this.writePDFToAndroid(salarySlipElement, outputFileName, loader);

          } else {
            loader.then((response) => response.dismiss())
            .catch((error) => console.log('Error in dismissing the loader:', error));

            this.notificationService.showErrorToast('Please allow the app to access your device\'s storage.', 2000, 'top');
          }
        })
        .catch((error) => console.error('Error in requesting the permission of external storage permission:', error))
      }
    })
    .catch((error) => console.error('Error in getting the status of external storage permission:', error));
  }

  writePDFToAndroid(salarySlipElement: HTMLElement, outputFileName: string, loader: Promise<any>): void {
    let pdfBlock = salarySlipElement;
    let options = {
      background: 'white',
      height: pdfBlock.clientHeight,
      width: pdfBlock.clientWidth
    };

    domtoimage.toPng(pdfBlock, options).then((fileUrl) => {
      let doc = new jsPDF('p', 'mm', 'a4');
      doc.addImage(fileUrl, 'PNG', 10, 10, 140, 180);

      let docRes = doc.output();
      let uint8array = new Uint8Array(docRes.length);

      for (let i = 0; i < docRes.length; i++) {
        uint8array[i] = docRes.charCodeAt(i);
      }

      let buffer = uint8array.buffer;

      this.file.writeFile(this.file.externalRootDirectory, outputFileName, buffer, { replace: true }).then((result) => {
        loader.then((response) => response.dismiss())
        .catch((error) => console.log('Error in dismissing the loader:', error));

        this.notificationService.showToast(`PDF has been saved with name '${outputFileName}' in your device.`, 2000, 'top');
      })
      .catch((error) => {
        loader.then((response) => response.dismiss())
        .catch((error) => console.log('Error in dismissing the loader:', error));

        this.notificationService.showErrorToast(`Error in generating the PDF.`, 2000, 'top');
      })

    }).catch((error) => {
      loader.then((response) => response.dismiss())
      .catch((error) => console.log('Error in dismissing the loader:', error));

      this.notificationService.showErrorToast(`Error in generating the PDF.`, 2000, 'top');
    });
  }

}
