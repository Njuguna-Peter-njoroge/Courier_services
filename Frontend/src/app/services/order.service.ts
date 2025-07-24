import { Injectable } from '@angular/core';

export interface Order {
  orderId: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  courierService: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  packageWeight: string;
  packageDimensions: string;
  price: string;
  notes: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private storageKey = 'orders';

  constructor() {
    const storedOrders = localStorage.getItem(this.storageKey);
    if (!storedOrders) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  getOrders(): Order[] {
    const orders = localStorage.getItem(this.storageKey);
    return orders ? JSON.parse(orders) : [];
  }

  addOrder(order: Order): void {
    const orders = this.getOrders();
    orders.push(order);
    localStorage.setItem(this.storageKey, JSON.stringify(orders));
  }

  clearOrders(): void {
    localStorage.setItem(this.storageKey, JSON.stringify([]));
  }
}
