import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChathistoryPage } from './chathistory.page';

describe('ChathistoryPage', () => {
  let component: ChathistoryPage;
  let fixture: ComponentFixture<ChathistoryPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChathistoryPage]
    });
    fixture = TestBed.createComponent(ChathistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
