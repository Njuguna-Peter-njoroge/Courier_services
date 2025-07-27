import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Order {
  id?: string;
  orderId: string;
  customerName?: string;
  pickupAddress: string;
  deliveryAddress: string;
  courierService: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  packageWeight: string;
  packageDimensions: string;
  price: string;
  notes: string;
  customerId?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:3000/orders'; // Adjust if different

  constructor(private http: HttpClient) {}

  // ✅ Get all orders
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  // ✅ Get orders by customer
  getOrdersByCustomer(customerId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/customer/${customerId}`);
  }

  // ✅ Get order by ID
  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  // ✅ Create a new order
  createOrder(order: Partial<Order>): Observable<any> {
    return this.http.post(`${this.apiUrl}`, order);
  }

  // ✅ Update an order
  updateOrder(id: string, order: Partial<Order>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, order);
  }

  updateOrderStatus(id: string, status: string, updatedBy: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, {
      status,
      reason: 'Status updated from frontend',
      updatedBy,
    });
  }


  // ✅ Delete an order
  deleteOrder(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  assignCourier(orderId: string, courierId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/assign-courier/${orderId}`, { courierId });
  }


  // ✅ Filter orders by status or date range
  filterOrders(status?: string, fromDate?: string, toDate?: string): Observable<Order[]> {
    let query = '';
    if (status) query += `status=${status}&`;
    if (fromDate) query += `fromDate=${fromDate}&`;
    if (toDate) query += `toDate=${toDate}`;

    return this.http.get<Order[]>(`${this.apiUrl}/filter?${query}`);
  }
}
