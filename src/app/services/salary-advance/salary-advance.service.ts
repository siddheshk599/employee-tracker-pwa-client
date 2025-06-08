import SalaryAdvance from '../../shared/models/salary-advance.model';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SalaryAdvanceService {

  constructor(
    private http: HttpClient,
    @Inject('baseUrl') private baseUrl
  ) {}

  addSalaryAdvance(salaryAdvance: any): Observable<SalaryAdvance> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<SalaryAdvance>(`${this.baseUrl}/salary-advances`, salaryAdvance, { headers: headers });
  }

  getSalaryAdvances(queryParams: string = ''): Observable<SalaryAdvance[]> {
    return this.http.get<SalaryAdvance[]>(`${this.baseUrl}/salary-advances${queryParams}`);
  }

  getSalaryAdvancesByEmpId(empId: string, queryParams: string = ''): Observable<SalaryAdvance[]> {
    return this.http.get<SalaryAdvance[]>(`${this.baseUrl}/salary-advances/employee/${empId}${queryParams}`);
  }

  updateSalaryAdvanceById(advanceId: string, data: any): Observable<SalaryAdvance> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<SalaryAdvance>(`${this.baseUrl}/salary-advances/${advanceId}`, data, { headers: headers });
  }
}
