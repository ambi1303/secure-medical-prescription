import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-verify-prescription',
  standalone: true,
  imports: [CommonModule, FormsModule, ZXingScannerModule],
  templateUrl: './verify-prescription.component.html',
})
export class VerifyPrescriptionComponent implements OnInit {
  prescriptionId: string = '';
  verificationResult: string = '';
  allowedFormats = [BarcodeFormat.QR_CODE];  // ✅ Fix: Define `allowedFormats`
  hasCamera = false;  // ✅ Fix: Define `hasCamera`

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    // ✅ Fix: Check if the device has a camera
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          this.hasCamera = devices.some(device => device.kind === 'videoinput');  // ✅ Detects if camera exists
        })
        .catch(() => {
          this.hasCamera = false;
        });
    }
  }

  verifyPrescription() {
    const token = localStorage.getItem('token');  
    if (!token) {
      this.verificationResult = "❌ Authentication required. Please log in.";
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`http://localhost:8050/verify-prescription?prescription_id=${this.prescriptionId}`, { headers })
      .subscribe(
        (response: any) => {
          this.verificationResult = `✅ Prescription is valid! \n Patient: ${response.patient_name} \n Medication: ${response.medication}`;
        },
        (error) => {
          if (error.status === 401) {
            this.verificationResult = "❌ Unauthorized. Please log in again.";
          } else {
            this.verificationResult = "❌ Prescription verification failed. Invalid ID or expired.";
          }
        }
      );
  }

  onCodeResult(event: any) {
    this.prescriptionId = event.text;  
    this.verifyPrescription();
  }
}
