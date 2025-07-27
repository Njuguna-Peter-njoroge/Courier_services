 // ...existing code...
import { Component, OnInit, OnDestroy } from '@angular/core';
import {Navbar} from '../Shared/navbar/navbar';
import {Footer} from '../Shared/footer/footer';
import {RouterLink} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../component/Shared/user.model';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-homepage',
  imports: [
    Navbar,
    Footer,
    RouterLink,
    NgIf
  ],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css'
})
export class Homepage implements OnInit, OnDestroy {
  currentUser: User | null = null;
  scrollToPricing() {
    const el = document.getElementById('pricing');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
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

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  scrollToAboutSection(): void {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
