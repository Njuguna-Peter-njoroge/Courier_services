import { Component } from '@angular/core';
import { Navbar } from '../Shared/navbar/navbar';
import { Footer } from '../Shared/footer/footer';
import { NgIf, NgFor } from '@angular/common';
import { NgClass } from '@angular/common';
import { OrderService, Order } from '../../services/order.service';
import { AuthService, User } from '../../services/auth.service';
import { CourierMapComponent } from '../map/map'; // ✅ Correct import name

@Component({
  selector: 'app-userdashboard',
  standalone: true,
  imports: [
    Navbar,
    Footer,
    NgIf,
    NgFor,
    NgClass,
    CourierMapComponent, // ✅ Use the correct component name
  ],
  templateUrl: './userdashboard.html',
  styleUrl: './userdashboard.css'
})
export class Userdashboard {
  // Call this method to refresh the user's orders (e.g., after creating a new order)
  refreshOrders() {
    this.loadUserOrders();
  }
  sidebarOpen = true;
  currentUser: User | null = null;
  userOrders: Order[] = [];

  constructor(private orderService: OrderService, private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUserOrders();
  }

  loadUserOrders() {
    if (this.currentUser) {
      const allOrders = this.orderService.getOrders();
      const userName = this.currentUser.name.toLowerCase();
      const userEmail = this.currentUser.email.toLowerCase();
      this.userOrders = allOrders.filter(order => {
        if (!order.customerName) return false;
        const customer = order.customerName.toLowerCase();
        return customer === userName || customer === userEmail;
      });
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
