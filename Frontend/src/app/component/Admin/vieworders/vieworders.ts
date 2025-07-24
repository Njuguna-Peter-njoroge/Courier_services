import { Component, OnInit } from '@angular/core';
import { Navbar } from '../../Shared/navbar/navbar';
import { Footer } from '../../Shared/footer/footer';
import { CommonModule } from '@angular/common';
import {Order, OrderService} from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-vieworders',
  standalone: true,
  imports: [Navbar, Footer, CommonModule],
  templateUrl: './vieworders.html',
  styleUrls: ['./vieworders.css']
})
export class ViewOrders implements OnInit {
  orders: Order[] = [];
  pageSize = 3;
  currentPage = 1;
  paginatedOrders: Order[] = [];
  totalPages = 1;

  couriers: any[] = [];
  isAdmin = false;

  constructor(private orderService: OrderService, private authService: AuthService, private userService: UserService) {}


  ngOnInit(): void {
    this.loadOrders();
    const user = this.authService.getCurrentUser();
    this.isAdmin = user?.role === 'admin';
    this.couriers = this.userService.getUsers().filter(u => u.role === 'courier');
  }
  assignCourier(order: Order, courierId: string) {
    const courier = this.couriers.find(c => c.id === courierId);
    if (courier) {
      order.courierService = courier.name;
      order.updatedAt = new Date().toISOString();
      // Save updated order
      const allOrders = this.orderService.getOrders();
      const idx = allOrders.findIndex(o => o.orderId === order.orderId);
      if (idx !== -1) {
        allOrders[idx] = order;
        localStorage.setItem('orders', JSON.stringify(allOrders));
        this.loadOrders();
      }
    }
  }

  loadOrders() {
    const allOrders = this.orderService.getOrders();
    const user = this.authService.getCurrentUser();
    if (user && user.role !== 'admin') {
      // Filter orders for the logged-in user (by id or email)
      this.orders = allOrders.filter(order =>
        (order.customerName === user.name || order.customerName === user.email || order.orderId === user.id)
      );
    } else {
      // Admin sees all orders
      this.orders = allOrders;
    }
    this.totalPages = Math.ceil(this.orders.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
    this.setPaginatedOrders();
  }

  setPaginatedOrders() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedOrders = this.orders.slice(start, end);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.setPaginatedOrders();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.setPaginatedOrders();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.setPaginatedOrders();
    }
  }
}
