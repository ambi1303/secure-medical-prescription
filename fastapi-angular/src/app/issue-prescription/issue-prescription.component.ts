// src/app/issue-prescription/issue-prescription.component.ts
import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({ 
  selector: 'app-issue-prescription',
  standalone:true,
  imports:[FormsModule],
  templateUrl: './issue-prescription.component.html',
  styleUrl:'./issue-prescription.component.css'
 })
 export class IssuePrescriptionComponent {
  patientName: string = '';
  medication: string = '';

  constructor(private http: HttpClient, private authService: AuthService) {}

  issuePrescription() {
      const headers = this.authService.getHeaders();
      const data = {
          patient_name: this.patientName,
          medication: this.medication
      };

      this.http.post('http://localhost:8050/issue-prescription', data, { headers })
          .subscribe(response => {
              console.log('Prescription Issued:', response);
          });
  }
}