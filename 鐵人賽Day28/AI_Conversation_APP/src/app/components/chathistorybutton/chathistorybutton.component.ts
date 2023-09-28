import { IonicModule } from '@ionic/angular';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chathistorybutton',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ],
  templateUrl: './chathistorybutton.component.html',
  styleUrls: ['./chathistorybutton.component.scss']
})
export class ChathistorybuttonComponent {
  constructor(private router: Router) { }

  onChatHistoryClick() {
    this.router.navigateByUrl('/chathistory');
  }
}
