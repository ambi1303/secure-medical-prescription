import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-verify-prescription',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './verify-prescription.component.html',
  styleUrl: './verify-prescription.component.css'
})
export class VerifyPrescriptionComponent {
  prescriptionId: string = '';
  prescriptionDetails: any = null;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  verifyPrescription() {
    if (!this.prescriptionId.trim()) {
      this.errorMessage = 'Please enter a valid Prescription ID.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.prescriptionDetails = null;

    const headers = this.authService.getHeaders();

    this.http.get(`http://localhost:8050/verify-prescription?prescription_id=${this.prescriptionId}`, { headers })
      .subscribe({
        next: (response: any) => {
          this.prescriptionDetails = response;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Prescription not found or expired.';
          this.isLoading = false;
        }
      });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
