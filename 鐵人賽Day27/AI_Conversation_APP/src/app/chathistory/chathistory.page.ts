import { IonContent, IonicModule } from '@ionic/angular';
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SqlitedbService } from '../services/sqlitedb.service';

@Component({
  selector: 'app-chathistory',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ],
  templateUrl: './chathistory.page.html',
  styleUrls: ['./chathistory.page.scss']
})
export class ChathistoryPage {
  @ViewChild('ionContent') ionContent!: IonContent;

  constructor(private sqlitedbService: SqlitedbService) { }

  get chatHistory$() {
    return this.sqlitedbService.chatHistory$;
  }

  ngAfterViewInit(): void {
    if (this.ionContent) {
      this.ionContent.scrollToBottom();
    }
  }
}
