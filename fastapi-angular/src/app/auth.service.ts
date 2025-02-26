// src/app/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8050';

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
      const body = new URLSearchParams();
      body.set('username', username);
      body.set('password', password);

      return this.http.post(`${this.apiUrl}/token`, body.toString(), {
          headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      });
  }

  getToken() {
      return localStorage.getItem('token');
  }

  getHeaders() {
      return new HttpHeaders({
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json'
      });
  }
}