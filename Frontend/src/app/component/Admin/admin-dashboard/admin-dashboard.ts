import { Component, OnInit, OnDestroy } from '@angular/core';
import {Navbar} from '../../Shared/navbar/navbar';
import {Footer} from '../../Shared/footer/footer';
import {NgClass, NgForOf} from '@angular/common';
import {RouterLink} from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    Navbar,
    Footer,
    NgClass,
    RouterLink,
    NgForOf
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit, OnDestroy {
  sidebarOpen = true;
  currentUser: User | null = null;
  private userSubscription: Subscription = new Subscription();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to current user changes
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Check session timeout periodically
    setInterval(() => {
      this.authService.checkSessionTimeout();
    }, 60000); // Check every minute
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    // Extend session on user activity
    this.authService.extendSession();
  }

  logout(): void {
    // Show confirmation dialog
    const confirmLogout = confirm('Are you sure you want to logout?');
    
    if (confirmLogout) {
      this.authService.logout();
    }
  }

  getUserName(): string {
    return this.authService.getUserName();
  }

  getUserRole(): string {
    return this.authService.getUserRole();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  stats = [
    { title: 'Users', value: 120 },
    { title: 'Products', value: 58 },
    { title: 'Orders', value: 34 },
    { title: 'Revenue', value: '$12,500' },
  ];

}
