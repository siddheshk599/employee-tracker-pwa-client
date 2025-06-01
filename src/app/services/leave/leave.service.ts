import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Leave from '../../shared/models/leave.model';
import { ProcessHttpMsgService } from '../process-http-msg/process-http-msg.service';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {

  constructor(
    private http: HttpClient,
    private processHttpMsgService: ProcessHttpMsgService,
    @Inject('baseUrl') private baseUrl
  ) { }

  addLeaveToDb(leave: Leave): Observable<Leave> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<Leave>(`${this.baseUrl}/leaves`, leave, { headers: headers }).pipe(catchError(this.processHttpMsgService.handleError));
  }

  getAllLeaveDetails(queryParams: string = ''): Observable<Leave[]> {
    return this.http.get<Leave[]>(`${this.baseUrl}/leaves${queryParams}`).pipe(catchError(this.processHttpMsgService.handleError));
  }

  updateLeaveDetailsById(leaveId: string, data: any): Observable<Leave> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<Leave>(`${this.baseUrl}/leaves/${leaveId}`, data, { headers: headers}).pipe(catchError(this.processHttpMsgService.handleError));
  }
}
