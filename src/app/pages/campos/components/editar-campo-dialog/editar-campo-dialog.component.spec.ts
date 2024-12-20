import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarCampoDialogComponent } from './editar-campo-dialog.component';

describe('EditarCampoDialogComponent', () => {
  let component: EditarCampoDialogComponent;
  let fixture: ComponentFixture<EditarCampoDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditarCampoDialogComponent]
    });
    fixture = TestBed.createComponent(EditarCampoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
