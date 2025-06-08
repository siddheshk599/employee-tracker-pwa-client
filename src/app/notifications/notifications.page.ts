import { Observable, Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { ChatReceiversPage } from './../chat-receivers/chat-receivers.page';
import Employee from '../shared/models/employee.model';
import { Component, Inject } from '@angular/core';
import { ChatService } from '../services/chat/chat.service';
import { NotificationService } from '../services/notification/notification.service';
import Chat from '../shared/models/chat.model';
import { secureStorage } from '../shared/storage';
import { functions } from '../shared/functions';
import { constants } from '../shared/constants';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage {

  errorMsg;
  segmentButton: string;
  storageEmpId: string;
  storageEmpPosition: string;

  chats: Chat[] = [];
  notifications: any[];
  filteredChats: Chat[] = [];
  receiverEmployee: Employee;

  textMsg: string = "";
  receiverEmpId: string = "";
  sharedFunctions = functions;
  socket: any;
  socketChatMsgSubscription: Subscription;

  constructor(
    @Inject('baseUrl') private serverBaseURL,
    private chatService: ChatService,
    private notificationService: NotificationService,
    private title: Title
  ) {}

  ionViewWillEnter(): void {
    this.title.setTitle(`Notification - ${constants.appName}`);
    this.segmentButton = 'notification';
    this.storageEmpId = secureStorage.getItem('empId');
    this.storageEmpPosition = secureStorage.getItem('position');

    this.receiverEmployee = undefined;
    this.receiverEmpId = undefined;
    this.chats = [];
    this.filteredChats = [];

    this.socketChatMsgSubscription = undefined;
    this.getChatsByEmpIdAsSenderOrReceiver(this.storageEmpId);
  }

  ionViewWillLeave(): void {
    this.errorMsg = undefined;
    this.chatSocketSwitch('disconnect');
  }

  segmentChange(event: any): void {
    if (event.target.value === 'notification') {
      this.getChatsByEmpIdAsSenderOrReceiver(this.storageEmpId);
    }
  }

  chatSocketSwitch(mode: 'connect' | 'disconnect'): void {
    if (mode === 'connect') {
      if (!this.socket) {
        this.socket = io.connect(this.serverBaseURL, {
          query: {
            token: secureStorage.getItem('jwtToken')
          }
        });
      }

      if (!this.socketChatMsgSubscription) {
        this.socketChatMsgSubscription = this.getChatMessagesFromSocket().subscribe(
          (chatMsg) => {
            if (
              ((this.storageEmpId === chatMsg.senderEmpId['_id']) ||
              (this.storageEmpId === chatMsg.receiverEmpId['_id'])) &&
              ((this.receiverEmpId === chatMsg.senderEmpId['_id']) ||
              (this.receiverEmpId === chatMsg.receiverEmpId['_id']))
            )
              this.filteredChats.push(chatMsg);
          },
          (error) => {
            this.errorMsg = <any>error;

            this.notificationService.showErrorToast('Error in getting your chat messages. Kindly try again.', 2000, 'top');
          }
        );
      }

    } else {
      if (this.socket) {
        this.socket.emit('disconnection');
        this.socket = undefined;
      }

      if (this.socketChatMsgSubscription) {
        this.socketChatMsgSubscription.unsubscribe();
        this.socketChatMsgSubscription = undefined;
      }
    }
  }

  selectChatReceiver(): void {
    let modal = this.notificationService.createModal(ChatReceiversPage, true);

    modal.then((response) => response.present())
    .catch((error) => console.error("Error in presenting the modal:", error));

    modal.then((response) => {
      response.onDidDismiss()
      .then((response) => {
        if (response.data instanceof Object === true) {
          if (response.data.hasOwnProperty("receiverEmployee")) {
            if (response.data['receiverEmployee']) {
              this.receiverEmployee = response.data['receiverEmployee'];
              this.receiverEmpId = this.receiverEmployee['_id'];

              this.chatSocketSwitch('connect');

              this.chatService.getChatsForSpecificSenderAndReceiver(this.storageEmpId, this.receiverEmpId).subscribe(
                (chatMsgs) => {
                  this.filteredChats = [...chatMsgs];
                },
                (error) => {
                  this.errorMsg = <any>error;

                  this.notificationService.showErrorToast('Error in getting your chat messages. Kindly try again.', 2000, 'top');
                }
              );
            }
          }
        }
      })
      .catch((error) => console.error("Error in getting the data from modal dismiss:", error));
    })
    .catch((error) => console.error("Error in handling the modal:", error));
  }

  getChatsByEmpIdAsSenderOrReceiver(empId: string): void {
    this.errorMsg = undefined;

    this.chatService.getChatsByEmpId(empId).subscribe(
      (chats) => {
        this.chats = [...chats];
        this.getNotifications(empId);
      },
      (error) => {
        this.errorMsg = <any>error;

        this.notificationService.showErrorToast('Error in getting your notifications. Please try again.', 2000, 'top');
      }
    );
  }

  getNotifications(empId: string): void {
    this.notifications = [...this.chats.filter((chat) => chat.receiverEmpId['_id'] === empId)];
  }

  filterChats(): void {
    if (this.receiverEmpId) {
      this.filteredChats = [...this.chats.filter((chat) => (
        (
          (chat.senderEmpId['_id'] === this.storageEmpId && chat.receiverEmpId['_id'] === this.receiverEmpId)
        ) || (
          (chat.senderEmpId['_id'] === this.receiverEmpId && chat.receiverEmpId['_id'] === this.storageEmpId)
        )
      ))];
    }
  }

  getChatMessagesFromSocket(): Observable<Chat> {
    let observable = new Observable<Chat>((observer) => {
      this.socket.on('get-message', (chatMsg: Chat) => {
        observer.next(chatMsg);
      });
    });

    return observable;
  }

  disconnectChat(): Observable<any> {
    return new Observable();
  }

  sendChatMsg(): void {
    this.errorMsg = undefined;

    if (this.receiverEmpId) {
      let textMsgRegEx = new RegExp(/[A-Za-z]+[0-9\s\.\,\-\@\#\$\%]*/);
      let textMsg = this.textMsg.trim();;

      if (textMsgRegEx.test(textMsg) && textMsg.length > 0 && textMsg.length <= 100) {
        let chatMsg: Chat = {
          senderEmpId: this.storageEmpId,
          receiverEmpId: this.receiverEmpId,
          message: this.textMsg
        };

        this.chatService.addChatMsg(chatMsg).subscribe(
          (chatMsg) => {
            this.filterChats();
            this.socket.emit('add-message', chatMsg);
            this.textMsg = "";
          },
          (error) => {
            this.errorMsg = <any>error;

            this.notificationService.showErrorToast('Error in sending your message. Please try again.', 2000, 'top');
          }
        );
      } else {
        this.notificationService.showErrorToast('Please enter a valid text message of up to 100 characters to send.', 2000, 'top');
      }
    } else {
      this.notificationService.showErrorToast('Please select a receiver to send your message.', 2000, 'top');
    }
  }
}
