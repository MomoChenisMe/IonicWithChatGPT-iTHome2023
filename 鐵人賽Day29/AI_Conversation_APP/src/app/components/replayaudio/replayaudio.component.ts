import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusService } from 'src/app/services/status.service';
import { Observable } from 'rxjs';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-replayaudio',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ],
  templateUrl: './replayaudio.component.html',
  styleUrls: ['./replayaudio.component.scss']
})
export class ReplayaudioComponent {
  constructor(private statusService: StatusService) { }

  get isLoading$(): Observable<boolean> {
    return this.statusService.isLoading$;
  }

  get isAudioPlaying$(): Observable<boolean> {
    return this.statusService.isAudioPlaying$;
  }

  onReplayAudio() {
    this.statusService.replayAudio();
  }
}
