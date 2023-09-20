import { SpeechService } from './../services/speech.service';
import { OpenaiService } from './../services/openai.service';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Robot3dComponent } from '../components/robot3d/robot3d.component';
import { VoicerecordingComponent } from '../components/voicerecording/voicerecording.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RecordingData } from 'capacitor-voice-recorder';
import { WhisperResponseModel } from '../models/chatgpt.model';
import { AudioConvertRequestModel, AudioConvertResponseModel } from '../models/audioconvert.model';
import { finalize, switchMap } from 'rxjs';
import { StatusService } from '../services/status.service';
import { ReplayaudioComponent } from '../components/replayaudio/replayaudio.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    Robot3dComponent,
    VoicerecordingComponent,
    ReplayaudioComponent
  ],
})
export class HomePage {
  constructor(private http: HttpClient,
    private statusService: StatusService,
    private openaiService: OpenaiService,
    private speechService: SpeechService) { }

    OnGetRecordingBase64Text(recordingBase64Data: RecordingData) {
      const requestData: AudioConvertRequestModel = {
        aacBase64Data: recordingBase64Data.value.recordDataBase64
      };
      //啟動讀取
      this.statusService.startLoading();
      //Audio Convert API
      this.http.post<AudioConvertResponseModel>('你的Web APP URL/AudioConvert/aac2m4a', requestData).pipe(
        //Whisper API
        switchMap(audioAPIResult => this.openaiService.whisperAPI(audioAPIResult.m4aBase64Data)),
        //Chat API
        switchMap(whisperAPIResult => this.openaiService.chatAPI(whisperAPIResult.text)),
        //Speech Service API
        switchMap(chatResult=> this.speechService.textToSpeech(chatResult)),
        finalize(() => {
          //停止讀取
          this.statusService.stopLoading();
        })
      ).subscribe(audioFileResult => this.statusService.playAudio(audioFileResult));
    }
}
