// src/app/verify-prescription/verify-prescription.component.ts
import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';


@Component({ 
  selector: 'app-verify-prescription',
  standalone:true,
  imports: [FormsModule],
  templateUrl: './verify-prescription.component.html',
  styleUrl: './verify-prescription.component.css'

 })
 
 export class VerifyPrescriptionComponent {
  signature: string = '';
  verificationResult: string = '';

  constructor(private http: HttpClient) {}

  verifyPrescription() {
      this.http.get(`http://localhost:8050/verify-prescription?signature=${this.signature}`)
          .subscribe(response => {
              this.verificationResult = JSON.stringify(response);
          });
  }
}
