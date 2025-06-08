import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Employee from '../../shared/models/employee.model';
import { catchError } from 'rxjs/operators';
import { ProcessHttpMsgService } from '../process-http-msg/process-http-msg.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  constructor(
    @Inject('baseUrl') private baseUrl,
    private http: HttpClient,
    private processHttpMsgService: ProcessHttpMsgService
  ) { }

  addEmployee(employee: Employee): Observable<Employee> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<Employee>(`${this.baseUrl}/users/register`, employee, { headers: headers }).pipe(catchError(this.processHttpMsgService.handleError));
  }

  getAllEmployeeDetails(queryParams: string = ''): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/employees${queryParams}`).pipe(catchError(this.processHttpMsgService.handleError));
  }

  getEmployeeDetailsById(empId: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/employees/${empId}`).pipe(catchError(this.processHttpMsgService.handleError));
  }

  getEmployeesByCompanyId(companyId: string, queryParams: string = ''): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/employees/company/${companyId}${queryParams}`).pipe(catchError(this.processHttpMsgService.handleError));
  }

  getEmployeesByBranchId(branchId: string, queryParams: string = ''): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/employees/branch/${branchId}${queryParams}`).pipe(catchError(this.processHttpMsgService.handleError));
  }

  getChatReceivers(empId: string, companyId: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/employees/${empId}?getChatReceivers=true&companyId=${companyId}&isActive=true&hasApproval=true`).pipe(catchError(this.processHttpMsgService.handleError));
  }

  updateEmployeeDetailsById(empId: string, data: any, queryParams: string = ''): Observable<Employee> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<Employee>(`${this.baseUrl}/employees/${empId}${queryParams}`, data, { headers: headers }).pipe(catchError(this.processHttpMsgService.handleError));
  }

  deleteEmployeeDetailsById(empId: string): Observable<Employee> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.delete<Employee>(`${this.baseUrl}/employees/${empId}`, { headers: headers });
  }

  resetPasswordById(empId: string, password: any): Observable<Employee> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<Employee>(`${this.baseUrl}/employees/${empId}/reset-password`, password, { headers: headers }).pipe(catchError(this.processHttpMsgService.handleError));
  }

  canMarkAttendance(employee: Employee): boolean {
    let canPunchInOut: boolean = false;
    let isWorkingDay: boolean = this.isWorkingDay(new Date(), employee);

    if (employee.activeAttendanceId) {
      canPunchInOut = true;

    } else if (isWorkingDay && employee.nextPossiblePunchIn) {
      let nextPunchInDate = new Date(employee.nextPossiblePunchIn);
      let currentDate = new Date();

      let diffInMins = Math.round((nextPunchInDate.getTime() - currentDate.getTime()) / 1000 / 60);

      canPunchInOut = (diffInMins <= 30) ? true : false;
    }

    return canPunchInOut;
  }

  canApplyForLeave(employee: Employee): boolean {
    let canApplyForLeave: boolean = false;

    if (employee) {
      let isWorkingDay: boolean = this.isWorkingDay(new Date(), employee);

      if (isWorkingDay) {
        if (employee.nextPossiblePunchIn) {
          let nextPunchInDate = new Date(employee.nextPossiblePunchIn);
          let currentDate = new Date();

          let diffInMins = Math.round((nextPunchInDate.getTime() - currentDate.getTime()) / 1000 / 60);

          canApplyForLeave = (diffInMins < 0) ? true : false;
        }
      }
    }

    return canApplyForLeave;
  }

  isWorkingDay(date: Date, employee: Employee): boolean {
    let hasWorkingDay: boolean = false;
    let days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    let dayIndex = date.getDay();
    hasWorkingDay = (employee['workingDays'].indexOf(days[dayIndex]) >= 0) ? true : false;

    return hasWorkingDay;
  }

}
