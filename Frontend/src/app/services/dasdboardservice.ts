import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = 'http://localhost:3000/api/admin/stats'; // ✅ Adjust if needed

  constructor(private http: HttpClient) {}

  getStats(): Observable<{
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    totalCouriers: number;
  }> {
    return this.http.get<{
      totalUsers: number;
      totalOrders: number;
      totalRevenue: number;
      totalCouriers: number;
    }>(this.apiUrl);
  }
}
