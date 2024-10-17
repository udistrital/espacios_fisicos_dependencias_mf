import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroEspaciosComponent } from './registro-espacios.component';

describe('RegistroEspaciosComponent', () => {
  let component: RegistroEspaciosComponent;
  let fixture: ComponentFixture<RegistroEspaciosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegistroEspaciosComponent]
    });
    fixture = TestBed.createComponent(RegistroEspaciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
