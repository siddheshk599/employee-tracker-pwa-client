import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatReceiversPage } from './chat-receivers.page';

const routes: Routes = [
  {
    path: '',
    component: ChatReceiversPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatReceiversPageRoutingModule {}
