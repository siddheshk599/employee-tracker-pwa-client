import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import CompanyBranch from '../../shared/models/company-branch.model';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProcessHttpMsgService } from '../process-http-msg/process-http-msg.service';

@Injectable({
  providedIn: 'root'
})
export class BranchService {

  constructor(
    @Inject('baseUrl') private baseUrl,
    private http: HttpClient,
    private processHttpMsgService: ProcessHttpMsgService
  ) { }

  addBranchToDb(branch: CompanyBranch): Observable<CompanyBranch> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<CompanyBranch>(`${this.baseUrl}/branches`, branch, { headers: headers }).pipe(catchError(this.processHttpMsgService.handleError));
  }

  getBranchDetailsById(branchId: string): Observable<CompanyBranch> {
    return this.http.get<CompanyBranch>(`${this.baseUrl}/branches/${branchId}`).pipe(catchError(this.processHttpMsgService.handleError));
  }

  deleteBranchById(branchId: string): Observable<CompanyBranch> {
    return this.http.delete<CompanyBranch>(`${this.baseUrl}/branches/${branchId}`).pipe(catchError(this.processHttpMsgService.handleError));
  }

  updateBranchById(branchId: string, data: any): Observable<CompanyBranch> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<CompanyBranch>(`${this.baseUrl}/branches/${branchId}`, data, { headers: headers }).pipe(catchError(this.processHttpMsgService.handleError));
  }
}
