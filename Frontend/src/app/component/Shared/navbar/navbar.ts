import { Component, OnInit, OnDestroy } from '@angular/core';
import {RouterLink} from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../component/Shared/user.model';
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
  scrollToAboutSection(): void {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToWhatWeOffer(): void {
    const section = document.getElementById('what-we-offer');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }
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
    return this.authService.getUserName() ?? '';
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

}
