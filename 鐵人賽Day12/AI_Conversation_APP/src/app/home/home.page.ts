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
  //建立Http header
  private headers = new HttpHeaders({
    'Authorization': 'Bearer {你的Token}'
  });

  constructor(private http: HttpClient,
    private statusService: StatusService) { }

  OnGetRecordingBase64Text(recordingBase64Data: RecordingData) {
    const requestData: AudioConvertRequestModel = {
      aacBase64Data: recordingBase64Data.value.recordDataBase64
    };
    //啟動讀取
    this.statusService.startLoading();
    //Audio Convert API
    this.http.post<AudioConvertResponseModel>('你的Web APP URL/AudioConvert/aac2m4a', requestData).pipe(
      switchMap(audioAPIResult => {
        //將Base64字串轉為Blob
        const byteCharacters = atob(audioAPIResult.m4aBase64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/m4a' });
        //建立FormData
        const formData = new FormData();
        formData.append('file', blob, 'audio.m4a');
        formData.append('model', 'whisper-1');
        formData.append('language', 'en');

        //Whisper API
        return this.http.post<WhisperResponseModel>('https://api.openai.com/v1/audio/transcriptions', formData, { headers: this.headers })
      }),
      finalize(() => {
        //停止讀取
        this.statusService.stopLoading();
      })
    ).subscribe(result => alert(result.text));
  }
}
