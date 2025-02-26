import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VerifyPrescriptionComponent } from './verify-prescription/verify-prescription.component';
import { IssuePrescriptionComponent } from './issue-prescription/issue-prescription.component';
import { LoginComponent } from './login/login.component';

@Component({
  selector: 'app-root',
  imports: [VerifyPrescriptionComponent, IssuePrescriptionComponent, LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'fastapi-angular';
}
