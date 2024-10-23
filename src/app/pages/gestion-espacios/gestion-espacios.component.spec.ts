import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionEspaciosComponent } from './gestion-espacios.component';

describe('GestionEspaciosComponent', () => {
  let component: GestionEspaciosComponent;
  let fixture: ComponentFixture<GestionEspaciosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GestionEspaciosComponent]
    });
    fixture = TestBed.createComponent(GestionEspaciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
