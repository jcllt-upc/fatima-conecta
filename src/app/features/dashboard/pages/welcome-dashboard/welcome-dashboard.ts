import { Component, signal, OnInit } from '@angular/core';

@Component({
  selector: 'app-welcome-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './welcome-dashboard.html',
  styleUrl: './welcome-dashboard.css'
})
export class WelcomeDashboardComponent implements OnInit {

  protected readonly currentRole = signal<string>('');

  public ngOnInit(): void {
    const roleSaved = localStorage.getItem('user_role');
    if (roleSaved) {
      this.currentRole.set(roleSaved);
    }
  }
}
