import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WelcomeDashboard } from './welcome-dashboard';

describe('WelcomeDashboard', () => {
  let component: WelcomeDashboard;
  let fixture: ComponentFixture<WelcomeDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomeDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
