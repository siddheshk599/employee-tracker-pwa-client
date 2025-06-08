import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProcessHttpMsgService } from '../process-http-msg/process-http-msg.service';

@Injectable({
  providedIn: 'root'
})
export class FileOperationsService {
  fileDownloadURL;

  constructor(
    @Inject('baseUrl') private baseUrl,
    private http: HttpClient,
    private processHttpMsgService: ProcessHttpMsgService
  ) {}

  addAnImage(base64Data: string, outputFileName: string, folderName: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const data = {
      base64Data: base64Data,
      outputFileName: outputFileName
    };

    return this.http.post<any>(`${this.baseUrl}/image?folderName=${folderName}`, data, { headers: headers }).pipe(catchError(this.processHttpMsgService.handleError));
  }

  deleteAnImage(path: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/image?path=${path}`).pipe(catchError(this.processHttpMsgService.handleError));
  }
  
}