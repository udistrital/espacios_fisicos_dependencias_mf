import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarEspacioDialogComponent } from './editar-espacio-dialog.component';

describe('EditarEspacioDialogComponent', () => {
  let component: EditarEspacioDialogComponent;
  let fixture: ComponentFixture<EditarEspacioDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditarEspacioDialogComponent]
    });
    fixture = TestBed.createComponent(EditarEspacioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
