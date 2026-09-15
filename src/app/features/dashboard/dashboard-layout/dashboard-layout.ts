import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router,RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink,RouterLinkActive],
  styleUrl: './dashboard-layout.css',
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayoutComponent implements OnInit {

  protected readonly currentUserRole = signal<string>('');

  constructor(private readonly router: Router) {}

  public ngOnInit(): void {
    const roleSaved = localStorage.getItem('user_role');

    if (roleSaved) {
      this.currentUserRole.set(roleSaved);
    } else {
      this.logout();
    }
  }

  protected logout(): void {
    localStorage.removeItem('user_role');
    this.router.navigate(['/login']);
  }
}
