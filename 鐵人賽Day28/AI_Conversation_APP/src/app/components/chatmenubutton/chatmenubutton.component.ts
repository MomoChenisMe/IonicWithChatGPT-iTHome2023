import { IonicModule, MenuController } from '@ionic/angular';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chatmenubutton',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ],
  templateUrl: './chatmenubutton.component.html',
  styleUrls: ['./chatmenubutton.component.scss']
})
export class ChatmenubuttonComponent {
  constructor(private menuCtrl: MenuController) { }

  onOpenCloseMenuClick() {
    this.menuCtrl.open('chat-menu');
  }
}
