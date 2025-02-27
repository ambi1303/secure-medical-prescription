import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { AuthService } from '../auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-verify-prescription',
  standalone: true,
  imports: [CommonModule, FormsModule, ZXingScannerModule],
  templateUrl: './verify-prescription.component.html',
})
export class VerifyPrescriptionComponent implements OnInit {
  prescriptionId: string = '';
  verificationResult: string = '';
  allowedFormats = [BarcodeFormat.QR_CODE];  // ✅ Ensure correct barcode format
  hasCamera = false;  // ✅ Track camera availability

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          this.hasCamera = devices.some(device => device.kind === 'videoinput');  // ✅ Detect if device has a camera
        })
        .catch(() => {
          this.hasCamera = false;
        });
    }
  }

  verifyPrescription() {
    this.prescriptionId = this.prescriptionId.trim();  // ✅ Remove extra spaces before sending
  
    const headers = this.authService.getHeaders();  
  
    this.http.get('http://localhost:8050/verify-prescription', {
      params: { prescription_id: this.prescriptionId },  
      headers: headers
    }).subscribe(
      (response: any) => {
        this.verificationResult = response.message;
      },
      (error) => {
        console.error("❌ Verification failed:", error);
        if (error.status === 401) {
          this.verificationResult = '❌ Authentication required. Please log in.';
        } else if (error.status === 404) {
          this.verificationResult = '❌ Prescription ID not found.';
        } else {
          this.verificationResult = '❌ An error occurred. Please try again.';
        }
      }
    );
  }
  

  onCodeResult(event: any) {
    console.log("🔍 QR Code Scanned:", event.text);  // ✅ Debugging log
    this.prescriptionId = event.text;  
    this.verifyPrescription();
  }
}
