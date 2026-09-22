import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Retroalimentacion } from './retroalimentacion';

describe('Retroalimentacion', () => {
  let component: Retroalimentacion;
  let fixture: ComponentFixture<Retroalimentacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Retroalimentacion],
    }).compileComponents();

    fixture = TestBed.createComponent(Retroalimentacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
