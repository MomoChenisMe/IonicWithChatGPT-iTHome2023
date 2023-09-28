import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Gesture, GestureController, GestureDetail, IonicModule } from '@ionic/angular';
import { BehaviorSubject, switchMap, interval, scan, map, of, startWith, shareReplay, Observable, Subject, takeUntil } from 'rxjs';
import { GenericResponse, RecordingData, VoiceRecorder } from 'capacitor-voice-recorder';
import { Haptics } from '@capacitor/haptics';
import { ImpactStyle } from '@capacitor/haptics/dist/esm/definitions';
import { StatusService } from 'src/app/services/status.service';

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
export class VoicerecordingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('recordingButtonElement') recordingButtonElementRef!: ElementRef;
  @Output() getRecordingBase64Text: EventEmitter<RecordingData> = new EventEmitter<RecordingData>();

  //長按手勢
  private longPressGesture!: Gesture;
  //解除訂閱用
  private destroy$ = new Subject();
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

  get isLoading$(): Observable<boolean> {
    return this.statusService.isLoading$;
  }

  get isAudioPlaying$(): Observable<boolean> {
    return this.statusService.isAudioPlaying$;
  }

  private get recordingButton(): HTMLDivElement {
    return this.recordingButtonElementRef?.nativeElement;
  }

  constructor(private gestureCtrl: GestureController,
    private statusService: StatusService) { }

  ngOnInit(): void {
    //訂閱讀取狀態
    this.statusService.isLoading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(loadingState => {
      if (this.longPressGesture) {
        if (loadingState) {
          this.longPressGesture.enable(false);
        } else {
          this.longPressGesture.enable();
        }
      }
    });
    //訂閱播放狀態
    this.statusService.isAudioPlaying$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(audioPlayingState => {
      if (this.longPressGesture) {
        if (audioPlayingState) {
          this.longPressGesture.enable(false);
        } else {
          this.longPressGesture.enable();
        }
      }
    });
  }

  ngOnDestroy(): void {
    //解除讀取狀態的訂閱
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.longPressGesture = this.gestureCtrl.create({
      el: this.recordingButton, //目標元素
      gestureName: 'LongPressGesture', //手勢的命名
      threshold: 0, //設置觸發手勢的閾值，0表示觸摸到就觸發
      onStart: (detail: GestureDetail) => {
        //震動反饋，震動程度有輕微（Light）、重度（Heavy）、中等（Medium）可以選擇
        Haptics.impact({ style: ImpactStyle.Medium });
        //手勢開始時的事件
        this.startRecording();
      },
      onEnd: (detail: GestureDetail) => {
        //震動反饋，震動程度有輕微（Light）、重度（Heavy）、中等（Medium）可以選擇
        Haptics.impact({ style: ImpactStyle.Medium });
        //手勢結束時的事件
        this.stopRecording();
      }
    }, true);
    //檢查並請求權限
    VoiceRecorder.requestAudioRecordingPermission().then((result: GenericResponse) => {
      if (result.value) {
        //啟用長按手勢
        this.longPressGesture.enable();
      }
    });
  }

  startRecording() {
    this.isRecordingSubject$.next(true);
    //開始錄音
    VoiceRecorder.startRecording();
  }

  stopRecording() {
    this.isRecordingSubject$.next(false);
    //停止錄音
    VoiceRecorder.stopRecording().then((result: RecordingData) => {
      if (result.value && result.value.recordDataBase64) {
        this.getRecordingBase64Text.emit(result);
      }
    });
  }
}
