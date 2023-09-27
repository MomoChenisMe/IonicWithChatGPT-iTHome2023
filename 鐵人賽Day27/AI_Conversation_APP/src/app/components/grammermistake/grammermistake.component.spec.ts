import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrammermistakeComponent } from './grammermistake.component';

describe('GrammermistakeComponent', () => {
  let component: GrammermistakeComponent;
  let fixture: ComponentFixture<GrammermistakeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GrammermistakeComponent]
    });
    fixture = TestBed.createComponent(GrammermistakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
