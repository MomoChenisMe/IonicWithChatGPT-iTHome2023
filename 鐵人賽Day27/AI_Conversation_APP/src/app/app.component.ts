import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SqlitedbService } from './services/sqlitedb.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class AppComponent {

  constructor(private sqlitedbService: SqlitedbService) {
    this.sqlitedbService.initializePlugin();
  }

}
