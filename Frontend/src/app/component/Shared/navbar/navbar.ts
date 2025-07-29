import { Component, OnInit, OnDestroy } from '@angular/core';
import {RouterLink} from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    NgIf
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private userSubscription: Subscription = new Subscription();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  logout(): void {
      this.authService.logout();
  }

  getUserName(): string {
    return this.authService.getUserName();
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentUser.isAuthenticated;
  }

}
