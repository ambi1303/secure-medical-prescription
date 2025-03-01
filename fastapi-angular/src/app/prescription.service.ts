import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PrescriptionService {
  private apiUrl = environment.apiUrl;

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
