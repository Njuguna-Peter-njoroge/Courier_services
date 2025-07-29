import { Component, OnInit, OnDestroy } from '@angular/core';
import { Navbar } from '../Shared/navbar/navbar';
import { Footer } from '../Shared/footer/footer';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../component/Shared/user.model';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';
import { ParcelService } from '../../services/parcel.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-homepage',
  imports: [
    Navbar,
    Footer,
    RouterLink,
    NgIf,
    FormsModule
  ],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css'
})
export class Homepage implements OnInit, OnDestroy {
  currentUser: User | null = null;
  trackingNumber: string = '';
  isTrackingNumberVerified: boolean = false;
  verificationMessage: string = '';
  private userSubscription: Subscription = new Subscription();

  constructor(private authService: AuthService, private parcelService: ParcelService, private router: Router) {}

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

  scrollToPricing() {
    const el = document.getElementById('pricing');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToAboutSection(): void {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  verifyTrackingNumber(): void {
    this.isTrackingNumberVerified = false;
    this.verificationMessage = '';

    if (!this.trackingNumber || this.trackingNumber.trim() === '') {
      this.verificationMessage = 'Please enter a tracking number.';
      return;
    }

    this.parcelService.getAllParcels().subscribe(parcels => {
      const parcel = parcels.find(p => p.trackingNumber === this.trackingNumber.trim());

      if (!parcel) {
        this.verificationMessage = 'Tracking number not found.';
        return;
      }

      if (!this.currentUser) {
        this.verificationMessage = 'User not authenticated.';
        return;
      }

      // Check if current user is sender or recipient
      if (parcel.sender.id === this.currentUser.id || parcel.recipient.id === this.currentUser.id) {
        this.isTrackingNumberVerified = true;
        this.verificationMessage = '';
      } else {
        this.verificationMessage = 'You are not authorized to track this parcel.';
      }
    }, error => {
      this.verificationMessage = 'Error verifying tracking number.';
    });
  }

  onTrackClick(): void {
    if (this.isTrackingNumberVerified) {
      // Navigate to map or tracking page with tracking number as parameter
      this.router.navigate(['/map'], { queryParams: { trackingNumber: this.trackingNumber.trim() } });
    }
  }
}
