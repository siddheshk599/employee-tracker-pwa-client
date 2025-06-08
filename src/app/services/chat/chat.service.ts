import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import Chat from '../../shared/models/chat.model';
import { catchError } from 'rxjs/operators';
import { ProcessHttpMsgService } from '../process-http-msg/process-http-msg.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private http: HttpClient,
    @Inject('baseUrl') private baseURL,
    private processHttpMsgService: ProcessHttpMsgService
  ) {}

  addChatMsg(chat: any): Observable<Chat> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<Chat>(`${this.baseURL}/chats`, chat, { headers: headers }).pipe(catchError(this.processHttpMsgService.handleError));
  }

  getAllChats(queryParams: string = ''): Observable<Chat[]> {
    return this.http.get<Chat[]>(`${this.baseURL}/chats${queryParams}`).pipe(catchError(this.processHttpMsgService.handleError));
  }

  getChatsByEmpId(empId: string): Observable<Chat[]> {
    return this.http.get<Chat[]>(`${this.baseURL}/chats?empId=${empId}`).pipe(catchError(this.processHttpMsgService.handleError));
  }

  getChatsForSpecificSenderAndReceiver(senderEmpId: string, receiverEmpId: string): Observable<Chat[]> {
    return this.http.get<Chat[]>(`${this.baseURL}/chats?senderEmpId=${senderEmpId}&receiverEmpId=${receiverEmpId}`).pipe(catchError(this.processHttpMsgService.handleError));
  }
}
