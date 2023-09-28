import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChathistorybuttonComponent } from './chathistorybutton.component';

describe('ChathistorybuttonComponent', () => {
  let component: ChathistorybuttonComponent;
  let fixture: ComponentFixture<ChathistorybuttonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChathistorybuttonComponent]
    });
    fixture = TestBed.createComponent(ChathistorybuttonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
