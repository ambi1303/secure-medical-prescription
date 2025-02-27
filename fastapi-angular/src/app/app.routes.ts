import { Routes, provideRouter } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { IssuePrescriptionComponent } from './issue-prescription/issue-prescription.component';
import { VerifyPrescriptionComponent } from './verify-prescription/verify-prescription.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'issue-prescription', component: IssuePrescriptionComponent },
  { path: 'verify-prescription', component: VerifyPrescriptionComponent },
  { path: 'logout', redirectTo: '/login', pathMatch: 'full' }
];

export const appRoutingProviders = [provideRouter(routes)];
