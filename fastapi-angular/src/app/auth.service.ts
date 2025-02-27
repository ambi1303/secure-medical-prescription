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
  private loggedIn = new BehaviorSubject<boolean>(false); // ✅ Tracks login state

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // ✅ Detects SSR (Server-Side Rendering)
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      this.loggedIn.next(!!token); // ✅ Set initial login state
    }
  }
  private users: { username: string; password: string; role: string }[] = [];
  private loggedInUser: { username: string; role: string } | null = null;
  /**
   * ✅ Login Method: Sends credentials, stores token, and navigates to dashboard
   */
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/token`, { username, password }).pipe(
      tap((response) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', response.access_token); // ✅ Store Token
        }
        this.loggedIn.next(true); // ✅ Update login state
        this.router.navigate(['/issue-prescription']); // ✅ Redirect after login
      })
    );
  }

  /**
   * ✅ Register Method: Registers a new user
   */
  register(username: string, password: string, role: string): Observable<any> {
    // Sends JSON payload to the /register endpoint
    return this.http.post(`${this.apiUrl}/register`, {
      username,
      password,
      role
    });
  }

  /**
   * ✅ Check if the user is logged in (Reactive)
   */
  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }
 
  

  /**
   * ✅ Logout Method: Clears token, updates state, and redirects to login
   */
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token'); // ✅ Clear Token
    }
    this.loggedIn.next(false); // ✅ Update login state
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
      'Content-Type': 'application/json'
    });
  }

  /**
   * ✅ Manually update login state (if needed)
   */
  updateLoginStatus(status: boolean) {
    this.loggedIn.next(status);
  }
  getUserRole(): string | null {
    return this.loggedInUser ? this.loggedInUser.role : null;
  }
  
}
