import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContextoEstudiante } from './contexto-estudiante';

describe('ContextoEstudiante', () => {
  let component: ContextoEstudiante;
  let fixture: ComponentFixture<ContextoEstudiante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextoEstudiante],
    }).compileComponents();

    fixture = TestBed.createComponent(ContextoEstudiante);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
