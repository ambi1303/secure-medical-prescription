import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { VerifyPrescriptionComponent } from './verify-prescription/verify-prescription.component';
import { IssuePrescriptionComponent } from './issue-prescription/issue-prescription.component';
import { LoginComponent } from './login/login.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  userRole: string | null = null;

  constructor(private authService: AuthService, private router: Router) {
    this.userRole = this.authService.getUserRole();
  }

  isDoctor(): boolean {
    return this.userRole === 'doctor';
  }

  isPharmacist(): boolean {
    return this.userRole === 'pharmacist';
  }

  logout() {
    this.authService.logout();
    this.userRole = null;
    this.router.navigate(['/login']);
  }
  
}