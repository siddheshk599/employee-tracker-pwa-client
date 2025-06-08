import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProcessHttpMsgService {

  constructor() { }

  public handleError(error: HttpErrorResponse | any) {
    let errorMsg: string;
    if (error.error instanceof ErrorEvent) {
      errorMsg = error.error.message;
    } else {
      errorMsg = `${error.status} - ${error.statusText || ''}`;
    }

    return throwError(errorMsg);
  }
}
