import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroEvidencias } from './registro-evidencias';

describe('RegistroEvidencias', () => {
  let component: RegistroEvidencias;
  let fixture: ComponentFixture<RegistroEvidencias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroEvidencias],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroEvidencias);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
