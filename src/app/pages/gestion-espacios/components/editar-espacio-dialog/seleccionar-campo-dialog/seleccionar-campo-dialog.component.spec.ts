import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionarCampoDialogComponent } from './seleccionar-campo-dialog.component';

describe('SeleccionarCampoDialogComponent', () => {
  let component: SeleccionarCampoDialogComponent;
  let fixture: ComponentFixture<SeleccionarCampoDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SeleccionarCampoDialogComponent]
    });
    fixture = TestBed.createComponent(SeleccionarCampoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
