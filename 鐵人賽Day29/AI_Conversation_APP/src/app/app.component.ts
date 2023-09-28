import { Component } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { IonicModule, Platform } from '@ionic/angular';
import { SqlitedbService } from './services/sqlitedb.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class AppComponent {

  constructor(private sqlitedbService: SqlitedbService,
    private platform: Platform) {
    //初始化設定
    this.initAppSettingAndPlugin();
  }

  private async initAppSettingAndPlugin() {
    //StatusBar初始化
    await this.setInitialStatusBar();
    //SQLite初始化
    await this.sqlitedbService.initializePlugin();
  }

  private async setInitialStatusBar() {
    //判斷是否為Android
    if (this.platform.is('android')) {
      await StatusBar.setBackgroundColor({
        color: '#FFFFFF'
      });
    }
    await this.updateStatusBar(Style.Light);
  }

  private async updateStatusBar(style: Style) {
    await StatusBar.setStyle({
      style: style
    });
  }
}
