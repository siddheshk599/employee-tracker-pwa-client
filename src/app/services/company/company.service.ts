import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Company from '../../shared/models/company.model';
import { ProcessHttpMsgService } from '../process-http-msg/process-http-msg.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(
    private http: HttpClient,
    @Inject('baseUrl') private baseUrl,
    private processHttpMsgService: ProcessHttpMsgService
  ) { }

  addCompanyToDb(company: Company): Observable<Company> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<Company>(`${this.baseUrl}/companies`, company, { headers: headers }).pipe(catchError(this.processHttpMsgService.handleError));
  }

  addBranchIdToCompany(branchId: string, companyId: string): Observable<Company> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<Company>(`${this.baseUrl}/companies/${companyId}/branches`, { branchId: branchId }, { headers: headers }).pipe(catchError(this.processHttpMsgService.handleError));
  }

  getAllCompanyDetails(queryParams: string = ''): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/companies${queryParams}`).pipe(catchError(this.processHttpMsgService.handleError)).pipe(catchError(this.processHttpMsgService.handleError));
  }

  getCompanyDetailsById(companyId: string): Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/companies/${companyId}`).pipe(catchError(this.processHttpMsgService.handleError));
  }

  updateCompanyDetailsById(companyId: string, data: any): Observable<Company> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<Company>(`${this.baseUrl}/companies/${companyId}`, data, { headers: headers }).pipe(catchError(this.processHttpMsgService.handleError));
  }

  addANewPositionByCompanyId(companyId: string, positionName: string): Observable<string[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<string[]>(`${this.baseUrl}/companies/${companyId}/positions`, { position: positionName }, { headers: headers });
  }

  updateAPositionByCompanyId(companyId: string, newPosition: string, insertAtIndex: number): Observable<string[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<string[]>(`${this.baseUrl}/companies/${companyId}/positions`, { position: newPosition, insertAtIndex: insertAtIndex }, { headers: headers });
  }

  deleteAPositionByCompanyId(companyId: string, positionName: string): Observable<string[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.delete<string[]>(`${this.baseUrl}/companies/${companyId}/positions?position=${positionName}`, { headers: headers });
  }
}
