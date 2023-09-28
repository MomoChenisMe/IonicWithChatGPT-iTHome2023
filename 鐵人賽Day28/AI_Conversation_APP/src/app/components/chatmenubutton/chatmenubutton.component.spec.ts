import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatmenubuttonComponent } from './chatmenubutton.component';

describe('ChatmenubuttonComponent', () => {
  let component: ChatmenubuttonComponent;
  let fixture: ComponentFixture<ChatmenubuttonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChatmenubuttonComponent]
    });
    fixture = TestBed.createComponent(ChatmenubuttonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
