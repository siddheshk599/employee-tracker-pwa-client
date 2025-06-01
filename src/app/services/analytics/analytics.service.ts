import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProcessHttpMsgService } from '../process-http-msg/process-http-msg.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(
    private http: HttpClient,
    @Inject('baseUrl') private baseUrl,
    private processHttpMsgService: ProcessHttpMsgService
  ) { }

  getAnalytics(empId: string): Observable<Object> {
    return this.http.get<Object>(`${this.baseUrl}/analytics?empId=${empId}`).pipe(catchError(this.processHttpMsgService.handleError));
  }

}