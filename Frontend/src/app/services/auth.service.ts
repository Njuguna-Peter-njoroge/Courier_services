import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastService } from './toast.service'; // Import ToastService

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'courier';
  isAuthenticated: boolean;
  loginTime?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private readonly STORAGE_KEY = 'currentUser';
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  constructor(private router: Router, private toastService: ToastService) { // Inject ToastService
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem(this.STORAGE_KEY);
    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        
        // Check if session is still valid
        if (user.loginTime && this.isSessionValid(user.loginTime)) {
          this.currentUserSubject.next(user);
        } else {
          // Session expired, clear storage
          this.clearUserData();
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearUserData();
      }
    }
  }

  private isSessionValid(loginTime: Date): boolean {
    const now = new Date().getTime();
    const loginTimestamp = new Date(loginTime).getTime();
    return (now - loginTimestamp) < this.SESSION_TIMEOUT;
  }

  login(email: string, password: string): Observable<boolean> {
    return new Observable(observer => {
      // Mock authentication - replace with real API call
      setTimeout(() => {
        if (this.validateCredentials(email, password)) {
          const user: User = {
            id: this.generateUserId(),
            name: this.getUserNameFromEmail(email),
            email: email,
            role: this.getUserRoleFromEmail(email),
            isAuthenticated: true,
            loginTime: new Date()
          };

          this.setCurrentUser(user);
          observer.next(true);
        } else {
          observer.next(false);
        }
        observer.complete();
      }, 1000); // Simulate API delay
    });
  }

  private validateCredentials(email: string, password: string): boolean {
    // Mock validation - replace with real authentication
    const validCredentials = [
      { email: 'admin@express.com', password: 'admin123' },
      { email: 'user@express.com', password: 'user123' },
      { email: 'courier@express.com', password: 'courier123' }
    ];

    return validCredentials.some(cred => 
      cred.email === email && cred.password === password
    );
  }

  private getUserNameFromEmail(email: string): string {
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  private getUserRoleFromEmail(email: string): 'admin' | 'user' | 'courier' {
    if (email.includes('admin')) return 'admin';
    if (email.includes('courier')) return 'courier';
    return 'user';
  }

  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout(): void {
    // Clear user data
    this.clearUserData();
    
    // Clear any other stored data if needed
    this.clearApplicationData();
    
    // Navigate to homepage
    this.router.navigate(['/homepage']);
    
    // Show logout confirmation using toast
    this.toastService.success('Successfully logged out');
  }

  private clearUserData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUserSubject.next(null);
  }

  private clearApplicationData(): void {
    // Clear any application-specific data on logout
    // You can add more items to clear here
    const keysToKeep = ['theme', 'language']; // Keep user preferences
    
    Object.keys(localStorage).forEach(key => {
      if (!keysToKeep.includes(key)) {
        // Optionally clear other data like orders, etc.
        // localStorage.removeItem(key);
      }
    });
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user ? user.isAuthenticated : false;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 'admin' : false;
  }

  isCourier(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 'courier' : false;
  }

  getUserRole(): string {
    const user = this.getCurrentUser();
    return user ? user.role : 'guest';
  }

  getUserName(): string {
    const user = this.getCurrentUser();
    return user ? user.name : 'Guest';
  }

  getUserEmail(): string {
    const user = this.getCurrentUser();
    return user ? user.email : '';
  }

  // Auto-logout on session timeout
  checkSessionTimeout(): void {
    const user = this.getCurrentUser();
    if (user && user.loginTime && !this.isSessionValid(user.loginTime)) {
      this.logout();
      this.toastService.warning('Your session has expired. Please log in again.'); // Replaced alert with toast notification
    }
  }

  // Extend session on user activity
  extendSession(): void {
    const user = this.getCurrentUser();
    if (user) {
      user.loginTime = new Date();
      this.setCurrentUser(user);
    }
  }
}
