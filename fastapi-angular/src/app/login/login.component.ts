import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  loginUser() {
    this.http.post('http://127.0.0.1:8050/token', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
        localStorage.setItem('token', response.access_token);
        this.router.navigate(['/issue-prescription']);
      },
      error: (err) => {
        console.error('Login failed:', err);
        alert('Invalid credentials!'); // Show user-friendly error
      }
    });
  }
}
