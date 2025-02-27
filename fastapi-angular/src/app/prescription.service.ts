import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PrescriptionService {
  private apiUrl = 'http://127.0.0.1:8050/verify-prescription';

  constructor(private http: HttpClient) {}

  verifyPrescription(prescriptionId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    console.log(`🔍 Sending GET Request to: ${this.apiUrl}?prescription_id=${prescriptionId}`);

    return this.http.get(this.apiUrl, {
      params: { prescription_id: prescriptionId }, // ✅ Pass as query param
      headers: headers,  // ✅ Attach Authorization header
    });
  }
}
