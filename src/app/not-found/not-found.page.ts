import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { constants } from '../shared/constants';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.page.html',
  styleUrls: ['./not-found.page.scss'],
})
export class NotFoundPage {

  constructor(
    private title: Title
  ) {}

  ionViewWillEnter(): void {
    this.title.setTitle(`Page Not Found (404) - ${constants.appName}`);
  }

}
