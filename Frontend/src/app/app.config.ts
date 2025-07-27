import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),                        // Global error listener
    provideZoneChangeDetection({ eventCoalescing: true }),       // Optimize zone change detection
    provideRouter(routes),                                       // App routes
    provideToastr(),                                             // Toastr notifications
    provideHttpClient(withFetch()),                              // ✅ Enable Fetch API (fixes withCredentials)
    provideAnimations()                                          // Required for animations like @flyInOut
  ]
};
