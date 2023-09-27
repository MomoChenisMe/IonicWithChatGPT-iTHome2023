import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuController, IonicModule, AlertController } from '@ionic/angular';
import { SqlitedbService } from 'src/app/services/sqlitedb.service';

@Component({
  selector: 'app-chatmenu',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ],
  templateUrl: './chatmenu.component.html',
  styleUrls: ['./chatmenu.component.scss']
})
export class ChatmenuComponent {
  constructor(private menuCtrl: MenuController,
    private sqlitedbService: SqlitedbService,
    private alertCtrl: AlertController) { }

  get chat$() {
    return this.sqlitedbService.chat$;
  }

  onChatRoomClick(id: number) {
    this.sqlitedbService.selectChatRoom(id);
    this.menuCtrl.close();
  }

  async onChatRoomDeleteClick(id: number) {
    const alert = await this.alertCtrl.create({
      message: '確定要刪除聊天室?',
      buttons: [{
        text: '取消',
        role: 'cancel'
      },
      {
        text: '刪除',
        role: 'confirm',
        cssClass: 'delete-color',
        handler: () => {
          this.sqlitedbService.deleteChatRoom(id);
        },
      },],
    });
    await alert.present();
  }

  onAddChatRoomClick() {
    this.sqlitedbService.addChatRoom();
  }
}
