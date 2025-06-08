import { secureStorage } from './../../shared/storage';
import Employee from '../../shared/models/employee.model';
import { EmployeeService } from './../employee/employee.service';
import { constants } from './../../shared/constants';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Attendance from '../../shared/models/attendance.model';
import { ProcessHttpMsgService } from '../process-http-msg/process-http-msg.service';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  constructor(
    private http: HttpClient,
    private employeeService: EmployeeService,
    private processHttpMsgService: ProcessHttpMsgService,
    @Inject('baseUrl') private baseUrl
  ) { }

  addAttendance(attendance: Attendance): Observable<Attendance> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<Attendance>(`${this.baseUrl}/attendances`, attendance, { headers: headers }).pipe(catchError(this.processHttpMsgService.handleError));
  }

  updateAttendanceById(attendanceId: string, data: any): Observable<Attendance> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<Attendance>(`${this.baseUrl}/attendances/${attendanceId}`, data, { headers: headers }).pipe(catchError(this.processHttpMsgService.handleError));
  }

  deleteAttendanceById(attendanceId: string): Observable<Attendance> {
    return this.http.delete<Attendance>(`${this.baseUrl}/attendances/${attendanceId}`).pipe(catchError(this.processHttpMsgService.handleError));
  }

  getAttendancesByEmpId(empId: string, queryParams: string = ''): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.baseUrl}/attendances/employees/${empId}${queryParams}`).pipe(catchError(this.processHttpMsgService.handleError));
  }

  getAttendanceMonthsByEmpId(empId: string): Observable<{ monthAndYear: string, startDate: string, endDate: string }[]> {
    return this.http.get<{ monthAndYear: string, startDate: string, endDate: string }[]>(`${this.baseUrl}/attendances/employees/${empId}?dataFormat=months`).pipe(catchError(this.processHttpMsgService.handleError));
  }

  getAllAttendances(queryParams: string = ''): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.baseUrl}/attendances${queryParams}`);
  }

  getAttendanceDatesOfAllEmpByQuery(queryParams: string): Observable<{ startDate: string, endDate: string }[]> {
    return this.http.get<{ startDate: string, endDate: string }[]>(`${this.baseUrl}/attendances${queryParams}&dataFormat=dates`).pipe(catchError(this.processHttpMsgService.handleError));
  }

  updateLocationHistory(attendanceId: string, update: any): Observable<Attendance> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<Attendance>(`${this.baseUrl}/attendances/${attendanceId}/location-history`, update, { headers: headers }).pipe(catchError(this.processHttpMsgService.handleError));
  }

  getLocationHistory(attendanceId: string): Observable<Object[]> {
    return this.http.get<Object[]>(`${this.baseUrl}/attendances/${attendanceId}/location-history`).pipe(catchError(this.processHttpMsgService.handleError));
  }

}
