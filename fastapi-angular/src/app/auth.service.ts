import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8050'; // ✅ FastAPI Backend URL
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  isLoggedIn$ = this.isLoggedInSubject.asObservable(); // ✅ Observable for login state

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // ✅ Detects SSR (Server-Side Rendering)
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      this.isLoggedInSubject.next(!!token); // ✅ Set initial login state
    }
  }

  /**
   * ✅ Login Method: Sends credentials, stores token, and navigates to dashboard
   */
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/token`, { username, password }).pipe(
      tap((response) => {
        if (response && response.access_token) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', response.access_token); // ✅ Store Token
            localStorage.setItem('userRole', response.role); // ✅ Store User Role
          }
          this.isLoggedInSubject.next(true); // ✅ Update login state
          this.router.navigate(['/dashboard']); // ✅ Redirect after login
        }
      })
    );
  }

  /**
   * ✅ Register Method: Registers a new user
   */
  register(username: string, password: string, role: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { username, password, role });
  }

  /**
   * ✅ Check if the user is logged in (Reactive)
   */
  isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  /**
   * ✅ Logout Method: Clears token, updates state, and redirects to login
   */
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token'); // ✅ Clear Token
      localStorage.removeItem('userRole'); // ✅ Clear User Role
    }
    this.isLoggedInSubject.next(false); // ✅ Update logout state
    this.router.navigate(['/login']); // ✅ Redirect to login page
  }

  /**
   * ✅ Get Headers with Authorization Token
   */
  getHeaders(): HttpHeaders {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token') || '';
    }

    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  /**
   * ✅ Get the current user's role
   */
  getUserRole(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('userRole');
    }
    return null;
  }

  /**
   * ✅ Check if the user is authenticated
   */
  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('token');
    }
    return false;
  }
}
