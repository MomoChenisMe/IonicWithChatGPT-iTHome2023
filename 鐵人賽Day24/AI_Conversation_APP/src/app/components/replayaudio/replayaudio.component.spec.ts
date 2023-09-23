import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplayaudioComponent } from './replayaudio.component';

describe('ReplayaudioComponent', () => {
  let component: ReplayaudioComponent;
  let fixture: ComponentFixture<ReplayaudioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReplayaudioComponent]
    });
    fixture = TestBed.createComponent(ReplayaudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
