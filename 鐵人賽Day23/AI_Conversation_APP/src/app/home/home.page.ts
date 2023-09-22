import { GrammermistakeComponent } from './../components/grammermistake/grammermistake.component';
import { SpeechService } from './../services/speech.service';
import { OpenaiService } from './../services/openai.service';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Robot3dComponent } from '../components/robot3d/robot3d.component';
import { VoicerecordingComponent } from '../components/voicerecording/voicerecording.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RecordingData } from 'capacitor-voice-recorder';
import { ConversationDataModel, GrammerDataModel, WhisperResponseModel } from '../models/chatgpt.model';
import { AudioConvertRequestModel, AudioConvertResponseModel } from '../models/audioconvert.model';
import { finalize, forkJoin, map, switchMap } from 'rxjs';
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
    ReplayaudioComponent,
    GrammermistakeComponent
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
    //重設文法狀態
    this.statusService.resetGrammerStatus();
    //啟動讀取
    this.statusService.startLoading();
    //Audio Convert API
    this.http.post<AudioConvertResponseModel>('你的Web APP URL/AudioConvert/aac2m4a', requestData).pipe(
      //Whisper API
      switchMap(audioAPIResult => this.openaiService.whisperAPI(audioAPIResult.m4aBase64Data)),
      //Chat API
      switchMap(whisperAPIResult => forkJoin([this.openaiService.chatAPI(whisperAPIResult.text), this.openaiService.checkGrammerHasMistake(whisperAPIResult.text)])),
      //Speech Service API
      switchMap(chatAndGrammerResult => this.textToSpeech(chatAndGrammerResult[0], chatAndGrammerResult[1])),
      finalize(() => {
        //停止讀取
        this.statusService.stopLoading();
      })
    ).subscribe(result => {
      //當前GPT回覆的語氣狀態
      this.statusService.setStyleStatus(result.gptStyle);
      //當前文法的對錯狀態
      this.statusService.setGrammerStatus({
        hasGrammerMistake: result.hasGrammerMistake,
        mistakeSentence: result.mistakeSentence
      });
      //播放音訊
      this.statusService.playAudio(result.audioFile);
    });
  }

  private textToSpeech(conversationData: ConversationDataModel, grammerData: GrammerDataModel) {
    return this.speechService.textToSpeech(conversationData).pipe(
      map(audioFileResult => ({
        audioFile: audioFileResult,
        gptStyle: conversationData.gptResponseTextStyle,
        hasGrammerMistake: grammerData.hasGrammerMistake,
        mistakeSentence: grammerData.mistakeSentence
      }))
    );
  }
}
