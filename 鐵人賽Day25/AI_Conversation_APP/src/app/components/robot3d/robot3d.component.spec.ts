import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Robot3dComponent } from './robot3d.component';

describe('Robot3dComponent', () => {
  let component: Robot3dComponent;
  let fixture: ComponentFixture<Robot3dComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Robot3dComponent]
    });
    fixture = TestBed.createComponent(Robot3dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
