import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Robot3dComponent } from '../components/robot3d/robot3d.component';
import { VoicerecordingComponent } from '../components/voicerecording/voicerecording.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RecordingData } from 'capacitor-voice-recorder';
import { WhisperResponseModel } from '../models/chatgpt.model';

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

  constructor(private http: HttpClient) { }

  OnGetRecordingBase64Text(recordingBase64Data: RecordingData) {
    const recordData = recordingBase64Data.value.recordDataBase64;
    const mimeType = recordingBase64Data.value.mimeType;
    //將Base64字串轉為Blob
    const byteCharacters = atob(recordData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    //建立FormData
    const formData = new FormData();
    formData.append('file', blob, 'audio.m4a');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    //Whisper API
    this.http.post<WhisperResponseModel>('https://api.openai.com/v1/audio/transcriptions', formData, { headers: this.headers }).subscribe(result => alert(result.text));
  }
}
