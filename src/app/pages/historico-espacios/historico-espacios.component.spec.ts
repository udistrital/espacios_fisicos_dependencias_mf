import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoEspaciosComponent } from './historico-espacios.component';

describe('HistoricoEspaciosComponent', () => {
  let component: HistoricoEspaciosComponent;
  let fixture: ComponentFixture<HistoricoEspaciosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HistoricoEspaciosComponent]
    });
    fixture = TestBed.createComponent(HistoricoEspaciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
