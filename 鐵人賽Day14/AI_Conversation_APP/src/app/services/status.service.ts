import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  //讀取狀態
  private isLoadingSubject$ = new BehaviorSubject<boolean>(false);

  get isLoading$(): Observable<boolean> {
    return this.isLoadingSubject$.asObservable();
  }

  constructor() { }

  public startLoading() {
    this.isLoadingSubject$.next(true);
  }

  public stopLoading() {
    this.isLoadingSubject$.next(false);
  }


}
