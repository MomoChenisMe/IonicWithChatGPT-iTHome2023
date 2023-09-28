import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatmenuComponent } from './chatmenu.component';

describe('ChatmenuComponent', () => {
  let component: ChatmenuComponent;
  let fixture: ComponentFixture<ChatmenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChatmenuComponent]
    });
    fixture = TestBed.createComponent(ChatmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
