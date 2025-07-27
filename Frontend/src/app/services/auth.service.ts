import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, ReplaySubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../component/Shared/user.model';

interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

interface LoginDto {
  email: string;
  password: string;
}

interface VerifyEmailDto {
  email: string;
  token: string;
}

interface ResendVerificationDto {
  email: string;
}

interface ForgotPasswordDto {
  email: string;
}

interface ResetPasswordDto {
  email: string;
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  message: string;
  user?: User;
  token?: string;
  access_token?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/auth';
  private loginStatusSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new ReplaySubject<User | null>(1);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Initialize login status
    this.loginStatusSubject.next(this.isLoggedIn());
    this.emitCurrentUser();
  }

  // Observable for login status changes
  get loginStatus$(): Observable<boolean> {
    return this.loginStatusSubject.asObservable();
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 409) {
        errorMessage = 'User already exists with this email';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Invalid request data';
      } else if (error.status === 401) {
        errorMessage = 'Invalid credentials';
      } else if (error.status === 404) {
        errorMessage = 'Service not found';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error';
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server';
      } else {
        errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
      }
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      originalError: error
    }));
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, dto)
      .pipe(
        catchError(this.handleError)
      );
  }

  login(email: string, password: string): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
        .pipe(catchError(this.handleError))
        .subscribe({
          next: (res) => {
            const token = res.access_token || res.token;
            if (token) {
              localStorage.setItem('access_token', token);
              if (res.user) {
                localStorage.setItem('user_data', JSON.stringify(res.user));
                localStorage.setItem('user_id', res.user.id || '');
                this.currentUserSubject.next(res.user);
              } else {
                this.currentUserSubject.next(null);
              }
              this.updateLoginStatus();
              observer.next(true);
            } else {
              observer.next(false);
            }
            observer.complete();
          },
          error: (err) => {
            observer.error(err);
          }
        });
    });
  }

  verifyEmail(dto: VerifyEmailDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/verify-email`, dto)
      .pipe(
        catchError(this.handleError)
      );
  }

  resendVerification(dto: ResendVerificationDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/resend-verification`, dto)
      .pipe(
        catchError(this.handleError)
      );
  }

  forgotPassword(dto: ForgotPasswordDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/forgot-password`, dto)
      .pipe(
        catchError(this.handleError)
      );
  }

  resetPassword(dto: ResetPasswordDto): Observable<AuthResponse> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post<AuthResponse>(`${this.apiUrl}/reset-password`, dto, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }


  // Helper method to check if user is logged in
  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  // Helper method to get current user token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Helper method to logout
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_data');
    this.loginStatusSubject.next(false);
    this.currentUserSubject.next(null);
  }

  // Emit current user from localStorage
  private emitCurrentUser(): void {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      this.currentUserSubject.next(JSON.parse(userData));
    } else {
      this.currentUserSubject.next(null);
    }
  }

  // Session timeout and extension stubs (implement as needed)
  checkSessionTimeout(): void {
    // Implement session timeout logic if needed
  }

  extendSession(): void {
    // Implement session extension logic if needed
  }

  // User info helpers
  getUserName(): string | null {
    const user = this.getCurrentUser();
    return user ? user.name : null;
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  // Method to update login status (called after successful login)
  updateLoginStatus(): void {
    this.loginStatusSubject.next(this.isLoggedIn());
  }

  // Method to get current user data
  getCurrentUser(): any {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  // Method to get current user role
  getCurrentUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  // Method to check if user is admin
  isAdmin(): boolean {
    return this.getCurrentUserRole() === 'ADMIN';
  }

  // Method to check if user is instructor
  isInstructor(): boolean {
    return this.getCurrentUserRole() === 'INSTRUCTOR';
  }

  // Method to check if user is student
  isStudent(): boolean {
    return this.getCurrentUserRole() === 'STUDENT';
  }
}
