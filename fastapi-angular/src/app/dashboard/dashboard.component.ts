import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // ✅ Import RouterModule

@Component({
  selector: 'app-dashboard',
  standalone: true, // ✅ Ensure standalone mode
  imports: [CommonModule, RouterModule], // ✅ Include RouterModule
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    console.log("Logging out...");
    this.router.navigate(['/login']); // Redirect to login page
  }
}
