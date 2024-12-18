import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CamposComponent } from './campos.component';

describe('CamposComponent', () => {
  let component: CamposComponent;
  let fixture: ComponentFixture<CamposComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CamposComponent]
    });
    fixture = TestBed.createComponent(CamposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
