import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EvaluacionProgreso } from './evaluacion-progreso';

describe('EvaluacionProgreso', () => {
  let component: EvaluacionProgreso;
  let fixture: ComponentFixture<EvaluacionProgreso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluacionProgreso],
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluacionProgreso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
