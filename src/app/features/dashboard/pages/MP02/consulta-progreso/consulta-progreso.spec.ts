import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultaProgreso } from './consulta-progreso';

describe('ConsultaProgreso', () => {
  let component: ConsultaProgreso;
  let fixture: ComponentFixture<ConsultaProgreso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaProgreso],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaProgreso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
