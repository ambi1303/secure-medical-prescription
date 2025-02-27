import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({ 
  selector: 'app-issue-prescription',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './issue-prescription.component.html',
  styleUrl: './issue-prescription.component.css'
})
export class IssuePrescriptionComponent {
  patientName: string = '';
  prescriptionDate: string = '';
  medication: string = '';
  instructions: string = '';
  doctorName: string = '';
  prescriptionId: string | null = null;
  qrCode: string | null = null;
  prescriptionIssued: boolean = false;

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {}

  issuePrescription() {
    const headers = this.authService.getHeaders();
    const data = {
      patient_name: this.patientName,
      medication: this.medication,
      instructions: this.instructions, 
      doctor_name: this.doctorName,
      prescription_date: this.prescriptionDate
    };

    this.http.post('http://localhost:8050/issue-prescription', data, { headers })
      .subscribe((response: any) => {
        this.prescriptionId = response.prescription_id;
        this.qrCode = `data:image/png;base64,${response.qr_code}`;
        this.prescriptionIssued = true;  // Hide form after issuing prescription
      }, (error) => {
        console.error('Error issuing prescription:', error);
      });
  }

  resetForm() {
    this.patientName = '';
    this.prescriptionDate = '';
    this.medication = '';
    this.instructions = '';
    this.doctorName = '';
    this.prescriptionId = null;
    this.qrCode = null;
    this.prescriptionIssued = false;  // Show the form again
  }

  navigate() {
    this.router.navigate(['/verify-prescription']); // ✅ Fix navigation
  }
}
