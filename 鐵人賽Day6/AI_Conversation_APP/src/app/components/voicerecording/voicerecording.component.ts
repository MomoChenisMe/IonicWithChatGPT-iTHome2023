import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { BehaviorSubject, switchMap, interval, scan, map, of, startWith, shareReplay, Observable } from 'rxjs';
import { GenericResponse, RecordingData, VoiceRecorder } from 'capacitor-voice-recorder';

@Component({
  selector: 'app-voicerecording',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ],
  templateUrl: './voicerecording.component.html',
  styleUrls: ['./voicerecording.component.scss']
})
export class VoicerecordingComponent implements OnInit {
  //錄音的開關
  private isRecordingSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  //錄音計時器
  public timer$ = this.isRecording$.pipe(
    switchMap(isRecording =>
      isRecording ? interval(1000).pipe(
        //使用scan累加每一秒的值，第一次累加會從0開始
        scan(acc => acc + 1, 0),
        //轉換為分鐘和秒數
        map(tick => ({
          minutes: Math.floor(tick / 60),
          seconds: tick % 60
        }))
      ) :
        //如果isRecording$為false，則發出一個重置的時間
        of({ minutes: 0, seconds: 0 })
    ),
    //將分鐘和秒數重新Format成兩位數顯示
    map(timeData => ({
      minutes: timeData.minutes.toString().padStart(2, '0'),
      seconds: timeData.seconds.toString().padStart(2, '0')
    })),
    //初始值
    startWith({ minutes: '00', seconds: '00' }),
    shareReplay(1)
  );

  get isRecording$(): Observable<boolean> {
    return this.isRecordingSubject$.asObservable();
  }

  ngOnInit(): void {
    //請求權限
    VoiceRecorder.requestAudioRecordingPermission().then((result: GenericResponse) => console.log(result));
  }

  OnStartRecordingClick() {
    this.isRecordingSubject$.next(true);
    //開始錄音
    VoiceRecorder.startRecording();
  }

  OnStopRecordingClick() {
    this.isRecordingSubject$.next(false);
    //停止錄音
    VoiceRecorder.stopRecording().then((result: RecordingData) => {
      if (result.value && result.value.recordDataBase64) {
        alert(result.value.recordDataBase64);
      }
    });
  }
}
