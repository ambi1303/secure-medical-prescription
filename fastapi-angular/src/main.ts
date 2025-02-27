import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appRoutingProviders } from './app/app.routes';
import { provideHttpClient,withFetch } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    appRoutingProviders, // Ensure routing is provided
    provideHttpClient(withFetch())
  ],
}).catch(err => console.error(err));
