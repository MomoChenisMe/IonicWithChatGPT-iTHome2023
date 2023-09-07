import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Robot3dComponent } from '../components/robot3d/robot3d.component';
import { VoicerecordingComponent } from '../components/voicerecording/voicerecording.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    Robot3dComponent,
    VoicerecordingComponent
  ],
})
export class HomePage {
  constructor() {}
}
