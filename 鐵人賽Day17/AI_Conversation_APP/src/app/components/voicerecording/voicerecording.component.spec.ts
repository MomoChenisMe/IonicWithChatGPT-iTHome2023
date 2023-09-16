import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoicerecordingComponent } from './voicerecording.component';

describe('VoicerecordingComponent', () => {
  let component: VoicerecordingComponent;
  let fixture: ComponentFixture<VoicerecordingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VoicerecordingComponent]
    });
    fixture = TestBed.createComponent(VoicerecordingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
