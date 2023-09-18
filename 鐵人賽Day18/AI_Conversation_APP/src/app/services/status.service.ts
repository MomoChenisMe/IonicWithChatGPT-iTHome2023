import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, defer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  //讀取狀態
  private isLoadingSubject$ = new BehaviorSubject<boolean>(false);
  //音訊播放狀態
  private playingStatusSubject$ = new BehaviorSubject<boolean>(false);

  get isLoading$(): Observable<boolean> {
    return this.isLoadingSubject$.asObservable();
  }

  get isAudioPlaying$(): Observable<boolean> {
    return this.playingStatusSubject$.asObservable();
  }

  constructor() { }

  public startLoading() {
    this.isLoadingSubject$.next(true);
  }

  public stopLoading() {
    this.isLoadingSubject$.next(false);
  }

  public playAudio(audioFile: Blob) {
    this.audioPlay(audioFile).subscribe(isPlaying => this.playingStatusSubject$.next(isPlaying));
  }

  private audioPlay(audioFile: Blob) {
    //創建一個新的observable來監聽音頻播放結束事件
    return defer(() => {
      return new Observable<boolean>(observer => {
        //播放開始通知
        observer.next(true);
        //創建一個Blob URL
        let url = URL.createObjectURL(audioFile);
        //建立一個新的Audio物件並播放
        let audio = new Audio(url);
        audio.load();
        audio.onended = () => {
          //播放結束通知
          observer.next(false);
          //結束Observable
          observer.complete();
        };
        audio.play();
      });
    });
  }
}
