import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { DashboardComponent } from './dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, DashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  isLoggedIn: boolean = false;
  userRole: string | null = null;

  constructor(private authService: AuthService, private router: Router) {
    // Initialize login state
    this.isLoggedIn = this.authService.isAuthenticated();
    this.userRole = localStorage.getItem('userRole'); // Fetch user role

    // Subscribe to authentication changes using isLoggedIn$
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
      this.userRole = localStorage.getItem('userRole'); // Update role on login/logout
    });
  }

  isDoctor(): boolean {
    return this.userRole === 'doctor';
  }

  isPharmacist(): boolean {
    return this.userRole === 'pharmacist';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); // Redirect after logout
  }
}
