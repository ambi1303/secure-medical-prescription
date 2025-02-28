import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone:true,
  imports: [CommonModule,FormsModule,RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})


export class RegisterComponent {
  username: string = '';
  password: string = '';
  role: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    // Call the service to register the user
    this.authService.register(this.username, this.password, this.role).subscribe({
      next: (response: any) => {
        console.log('Registration successful:', response);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration failed:', err);
        alert('Registration failed: ' + err.error.detail);
      }
    });
  }
}
