import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Robot3dComponent } from '../components/robot3d/robot3d.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    Robot3dComponent
  ],
})
export class HomePage {
  constructor() {}
}
