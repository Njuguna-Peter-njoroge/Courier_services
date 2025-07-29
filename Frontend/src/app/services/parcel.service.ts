// import { User } from './../../../../Backend/src/Interfaces/userInterfaces';
// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable, of, delay, forkJoin } from 'rxjs';
// import { catchError, map, switchMap } from 'rxjs/operators';
// import { Parcel, ParcelStatus, Priority, ParcelFilter, StatusChange, UserInfo, CourierInfo, Address, DeliveryInfo } from '../models/parcel.model';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { environment } from '../../environments/environment';
// import { UserService } from './user.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class ParcelService {
//   private parcelsSubject = new BehaviorSubject<Parcel[]>([]);
//   public parcels$ = this.parcelsSubject.asObservable();

//   private readonly STORAGE_KEY = 'parcels_data';

//   constructor(private http: HttpClient, private userService: UserService) {
//     this.loadParcels();
//   }

//   private getHeaders(): { headers: HttpHeaders } {
//     const token = localStorage.getItem('access_token');
//     return {
//       headers: new HttpHeaders({
//         Authorization: `Bearer ${token}`
//       })
//     };
//   }


//   getOrders(): Observable<any[]> {
//     return this.http.get<any[]>(`${environment.apiUrl}/orders`, this.getHeaders()).pipe(
//       switchMap(orders => {
//         if (!orders || orders.length === 0) {
//           return of([]);
//         }
//         const enrichedOrders$ = orders.map(order => {
//           if (order.customerId) {
//             return this.userService.findById(order.customerId).pipe(
//               catchError(error => {
//                 console.error('Error fetching customer for order', order.orderId, error);
//                 return of(null);
//               }),
//               map(customer => {
//                 console.log('Fetched customer for order', order.orderId, customer);
//                 order.customer = customer?.data || null;
//                 return order;
//               })
//             );
//           } else {
//             order.customer = null;
//             return of(order);
//           }
//         });
//         return forkJoin(enrichedOrders$);
//       })
//     );
//   }

//   getParcels(): Observable<Parcel[]> {
//     return this.http.get<Parcel[]>(`${environment.apiUrl}/parcels`, this.getHeaders());
//   }

//   private loadParcels(): void {
//     localStorage.removeItem(this.STORAGE_KEY); // Clear localStorage to avoid stale sender data
//     this.getOrders().subscribe({
//       next: (orders) => {
//         const parcels = this.convertOrdersToParcels(orders);
//         this.parcelsSubject.next(parcels);
//       },
//       error: (error) => {
//         console.error('Error loading orders:', error);
//       }
//     });
//   }

//   private saveParcels(parcels: Parcel[]): void {
//     localStorage.setItem(this.STORAGE_KEY, JSON.stringify(parcels));
//     this.parcelsSubject.next(parcels);
//   }

//   private initializeDummyData(): void {
//     const dummyParcels: Parcel[] = [
//       {
//         id: '1',
//         trackingNumber: 'EXP001234',
//         status: ParcelStatus.IN_TRANSIT,
//         sender: {
//           id: 'user1',
//           name: 'John Doe',
//           email: 'john@example.com',
//           phone: '+1234567890',
//           address: {
//             street: '123 Main St',
//             city: 'New York',
//             state: 'NY',
//             zipCode: '10001',
//             country: 'USA'
//           }
//         },
//         recipient: {
//           id: 'user2',
//           name: 'Jane Smith',
//           email: 'jane@example.com',
//           phone: '+1987654321',
//           address: {
//             street: '456 Oak Ave',
//             city: 'Los Angeles',
//             state: 'CA',
//             zipCode: '90210',
//             country: 'USA'
//           }
//         },
//         courier: {
//           id: 'courier1',
//           name: 'Mike Wilson',
//           email: 'mike@express.com',
//           phone: '+1555123456',
//           vehicleType: 'Van',
//           isAvailable: true,
//           currentLocation: 'Downtown LA'
//         },
//         createdAt: new Date('2024-01-15T10:30:00'),
//         updatedAt: new Date('2024-01-16T14:20:00'),
//         statusHistory: [
//           {
//             status: ParcelStatus.PENDING,
//             timestamp: new Date('2024-01-15T10:30:00'),
//             updatedBy: 'system',
//             reason: 'Order created'
//           },
//           {
//             status: ParcelStatus.CONFIRMED,
//             timestamp: new Date('2024-01-15T11:00:00'),
//             updatedBy: 'admin',
//             reason: 'Payment confirmed'
//           },
//           {
//             status: ParcelStatus.PICKED_UP,
//             timestamp: new Date('2024-01-15T15:30:00'),
//             updatedBy: 'courier1',
//             reason: 'Package picked up from sender'
//           },
//           {
//             status: ParcelStatus.IN_TRANSIT,
//             timestamp: new Date('2024-01-16T09:00:00'),
//             updatedBy: 'courier1',
//             reason: 'Package in transit to destination'
//           }
//         ],
//         deliveryDetails: {
//           pickupAddress: {
//             street: '123 Main St',
//             city: 'New York',
//             state: 'NY',
//             zipCode: '10001',
//             country: 'USA'
//           },
//           deliveryAddress: {
//             street: '456 Oak Ave',
//             city: 'Los Angeles',
//             state: 'CA',
//             zipCode: '90210',
//             country: 'USA'
//           },
//           pickupTime: new Date('2024-01-15T15:30:00'),
//           specialInstructions: 'Handle with care - fragile items',
//           signatureRequired: true
//         },
//         weight: 2.5,
//         dimensions: '30x20x15 cm',
//         description: 'Electronics package',
//         priority: Priority.HIGH,
//         estimatedDelivery: new Date('2024-01-18T16:00:00'),
//         cost: 25.99
//       },
//       {
//         id: '2',
//         trackingNumber: 'EXP001235',
//         status: ParcelStatus.DELIVERED,
//         sender: {
//           id: 'user3',
//           name: 'Alice Johnson',
//           email: 'alice@example.com',
//           phone: '+1234567891',
//           address: {
//             street: '789 Pine St',
//             city: 'Chicago',
//             state: 'IL',
//             zipCode: '60601',
//             country: 'USA'
//           }
//         },
//         recipient: {
//           id: 'user4',
//           name: 'Bob Brown',
//           email: 'bob@example.com',
//           phone: '+1987654322',
//           address: {
//             street: '321 Elm St',
//             city: 'Miami',
//             state: 'FL',
//             zipCode: '33101',
//             country: 'USA'
//           }
//         },
//         courier: {
//           id: 'courier2',
//           name: 'Sarah Davis',
//           email: 'sarah@express.com',
//           phone: '+1555123457',
//           vehicleType: 'Motorcycle',
//           isAvailable: true,
//           currentLocation: 'Miami Beach'
//         },
//         createdAt: new Date('2024-01-10T09:15:00'),
//         updatedAt: new Date('2024-01-12T11:45:00'),
//         statusHistory: [
//           {
//             status: ParcelStatus.PENDING,
//             timestamp: new Date('2024-01-10T09:15:00'),
//             updatedBy: 'system',
//             reason: 'Order created'
//           },
//           {
//             status: ParcelStatus.CONFIRMED,
//             timestamp: new Date('2024-01-10T10:00:00'),
//             updatedBy: 'admin',
//             reason: 'Payment confirmed'
//           },
//           {
//             status: ParcelStatus.PICKED_UP,
//             timestamp: new Date('2024-01-10T14:30:00'),
//             updatedBy: 'courier2',
//             reason: 'Package picked up'
//           },
//           {
//             status: ParcelStatus.IN_TRANSIT,
//             timestamp: new Date('2024-01-11T08:00:00'),
//             updatedBy: 'courier2',
//             reason: 'In transit'
//           },
//           {
//             status: ParcelStatus.OUT_FOR_DELIVERY,
//             timestamp: new Date('2024-01-12T09:00:00'),
//             updatedBy: 'courier2',
//             reason: 'Out for delivery'
//           },
//           {
//             status: ParcelStatus.DELIVERED,
//             timestamp: new Date('2024-01-12T11:45:00'),
//             updatedBy: 'courier2',
//             reason: 'Successfully delivered',
//             notes: 'Delivered to recipient at front door'
//           }
//         ],
//         deliveryDetails: {
//           pickupAddress: {
//             street: '789 Pine St',
//             city: 'Chicago',
//             state: 'IL',
//             zipCode: '60601',
//             country: 'USA'
//           },
//           deliveryAddress: {
//             street: '321 Elm St',
//             city: 'Miami',
//             state: 'FL',
//             zipCode: '33101',
//             country: 'USA'
//           },
//           pickupTime: new Date('2024-01-10T14:30:00'),
//           deliveryTime: new Date('2024-01-12T11:45:00'),
//           specialInstructions: 'Leave at front door if no answer',
//           signatureRequired: false
//         },
//         weight: 1.2,
//         dimensions: '25x15x10 cm',
//         description: 'Documents package',
//         priority: Priority.NORMAL,
//         estimatedDelivery: new Date('2024-01-12T12:00:00'),
//         actualDelivery: new Date('2024-01-12T11:45:00'),
//         cost: 15.50
//       },
//       {
//         id: '3',
//         trackingNumber: 'EXP001236',
//         status: ParcelStatus.PENDING,
//         sender: {
//           id: 'user5',
//           name: 'Charlie Wilson',
//           email: 'charlie@example.com',
//           phone: '+1234567892',
//           address: {
//             street: '555 Broadway',
//             city: 'Seattle',
//             state: 'WA',
//             zipCode: '98101',
//             country: 'USA'
//           }
//         },
//         recipient: {
//           id: 'user6',
//           name: 'Diana Prince',
//           email: 'diana@example.com',
//           phone: '+1987654323',
//           address: {
//             street: '777 Market St',
//             city: 'San Francisco',
//             state: 'CA',
//             zipCode: '94102',
//             country: 'USA'
//           }
//         },
//         createdAt: new Date('2024-01-20T16:45:00'),
//         updatedAt: new Date('2024-01-20T16:45:00'),
//         statusHistory: [
//           {
//             status: ParcelStatus.PENDING,
//             timestamp: new Date('2024-01-20T16:45:00'),
//             updatedBy: 'system',
//             reason: 'Order created - awaiting payment confirmation'
//           }
//         ],
//         deliveryDetails: {
//           pickupAddress: {
//             street: '555 Broadway',
//             city: 'Seattle',
//             state: 'WA',
//             zipCode: '98101',
//             country: 'USA'
//           },
//           deliveryAddress: {
//             street: '777 Market St',
//             city: 'San Francisco',
//             state: 'CA',
//             zipCode: '94102',
//             country: 'USA'
//           },
//           specialInstructions: 'Call before delivery',
//           signatureRequired: true
//         },
//         weight: 3.8,
//         dimensions: '40x30x20 cm',
//         description: 'Gift package',
//         priority: Priority.URGENT,
//         estimatedDelivery: new Date('2024-01-22T10:00:00'),
//         cost: 35.75
//       }
//     ];

//     this.saveParcels(dummyParcels);
//   }

//   // CRUD Operations
//   getAllParcels(): Observable<Parcel[]> {
//     return this.parcels$.pipe(delay(500)); // Simulate API delay
//   }

//   // Method to refresh data (reload both parcels and orders)
//   refreshData(): void {
//     this.loadParcels();
//   }

//   getParcelById(id: string): Observable<Parcel | undefined> {
//     return new Observable(observer => {
//       const parcels = this.parcelsSubject.value;
//       const parcel = parcels.find(p => p.id === id);
//       observer.next(parcel);
//       observer.complete();
//     });
//   }

//   createParcel(parcel: Omit<Parcel, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Observable<Parcel> {
//     if (!parcel.sender || !parcel.sender.name || !parcel.sender.email) {
//       console.error('createParcel: Missing sender information', parcel.sender);
//       throw new Error('Sender information is required for parcel creation');
//     }
//     return this.http.post<Parcel>(`${environment.apiUrl}/parcels`, parcel, this.getHeaders());
//   }
  

//   updateParcel(id: string, updates: Partial<Parcel>): Observable<Parcel | null> {
//     return new Observable<Parcel | null>(observer => {
//       const parcels = this.parcelsSubject.value || [];
//       const index = parcels.findIndex((p: Parcel) => p.id === id);
      
//       if (index !== -1) {
//         const updatedParcel = {
//           ...parcels[index],
//           ...updates,
//           updatedAt: new Date()
//         };
        
//         parcels[index] = updatedParcel;
//         this.saveParcels(parcels);
//         observer.next(updatedParcel);
//       } else {
//         observer.next(null);
//       }
//       observer.complete();
//     });
//   }

//   updateParcelStatus(id: string, status: ParcelStatus, reason?: string, updatedBy: string = 'admin'): Observable<boolean> {
//     const body = {
//       status,
//       reason,
//       updatedBy
//     };
//     return this.http.patch<boolean>(`${environment.apiUrl}/parcels/${id}`, body, this.getHeaders());
//   }

//   updateOrderStatus(id: string, status: string, reason?: string): Observable<any> {
//     const body = {
//       status,
//       reason
//     };
//     return this.http.patch<any>(`${environment.apiUrl}/orders/${id}/status`, body, this.getHeaders());
//   }

//   deleteParcel(id: string): Observable<boolean> {
//     return new Observable(observer => {
//       const parcels = this.parcelsSubject.value;
//       const filteredParcels = parcels.filter(p => p.id !== id);
      
//       if (filteredParcels.length < parcels.length) {
//         this.saveParcels(filteredParcels);
//         observer.next(true);
//       } else {
//         observer.next(false);
//       }
//       observer.complete();
//     });
//   }

//   filterParcels(filter: ParcelFilter): Observable<Parcel[]> {
//     return new Observable(observer => {
//       let parcels = this.parcelsSubject.value;
      
//       if (filter.status) {
//         parcels = parcels.filter(p => p.status === filter.status);
//       }
      
//       if (filter.priority) {
//         parcels = parcels.filter(p => p.priority === filter.priority);
//       }
      
//       if (filter.searchTerm) {
//         const term = filter.searchTerm.toLowerCase();
//         parcels = parcels.filter(p => 
//           p.trackingNumber.toLowerCase().includes(term) ||
//           p.sender.name.toLowerCase().includes(term) ||
//           p.recipient.name.toLowerCase().includes(term) ||
//           p.description.toLowerCase().includes(term)
//         );
//       }
      
//       if (filter.dateFrom) {
//         parcels = parcels.filter(p => new Date(p.createdAt) >= filter.dateFrom!);
//       }
      
//       if (filter.dateTo) {
//         parcels = parcels.filter(p => new Date(p.createdAt) <= filter.dateTo!);
//       }
      
//       if (filter.courierId) {
//         parcels = parcels.filter(p => p.courier?.id === filter.courierId);
//       }
      
//       observer.next(parcels);
//       observer.complete();
//     });
//   }

//   private generateId(): string {
//     return 'parcel_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
//   }

//   public convertOrdersToParcels(orders: any[]): Parcel[] {
//     return orders.map(order => {
//       // Parse recipient info from notes string
//       const recipientMatch = order.notes?.match(/Receiver:\s*([^()]+)\s*\(([^,]+),\s*([^)]+)\)/i);
//       const recipientName = recipientMatch ? recipientMatch[1].trim() : 'Recipient';
//       const recipientEmail = recipientMatch ? recipientMatch[2].trim() : 'recipient@example.com';
//       const recipientPhone = recipientMatch ? recipientMatch[3].trim() : '+1987654321';

//       const parcel: Parcel = {
//         id: order.orderId || this.generateId(),
//         orderUuid: order.id,  // Add actual order UUID here
//         trackingNumber: order.orderId || 'ORD' + Date.now(),
//         status: this.mapOrderStatusToParcelStatus(order.status),
//         sender: {
//           id: order.User?.id,
//           name: order.User.name,
//           email: order.User.email,
//           phone: order.User.phone, 
//           address: this.parseAddress(order.pickupAddress)
//         },
//         recipient: {
//           id: 'recipient_' + order.orderId,
//           name: recipientName,
//           email: recipientEmail,
//           phone: recipientPhone,
//           address: this.parseAddress(order.deliveryAddress)
//         },
//         createdAt: new Date(order.createdAt || Date.now()),
//         updatedAt: new Date(order.updatedAt || Date.now()),
//         statusHistory: [{
//           status: this.mapOrderStatusToParcelStatus(order.status),
//           timestamp: new Date(order.createdAt || Date.now()),
//           updatedBy: 'system',
//           reason: 'Order converted to parcel'
//         }],
//         deliveryDetails: {
//           pickupAddress: this.parseAddress(order.pickupAddress),
//           deliveryAddress: this.parseAddress(order.deliveryAddress),
//           specialInstructions: order.notes || '',
//           signatureRequired: false
//         },
//         weight: parseFloat(order.packageWeight) || 1.0,
//         dimensions: order.packageDimensions || '20x15x10 cm',
//         description: order.courierService || 'Standard delivery',
//         priority: Priority.NORMAL,
//         estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
//         cost: parseFloat(order.price) || 0
//       };
//       return parcel;
//     });
//   }

//   private mapOrderStatusToParcelStatus(orderStatus: string): ParcelStatus {
//     const statusMap: { [key: string]: ParcelStatus } = {
//       'pending': ParcelStatus.PENDING,
//       'confirmed': ParcelStatus.CONFIRMED,
//       'picked_up': ParcelStatus.PICKED_UP,
//       'in_transit': ParcelStatus.IN_TRANSIT,
//       'delivered': ParcelStatus.DELIVERED,
//       'cancelled': ParcelStatus.CANCELLED
//     };
//     return statusMap[orderStatus?.toLowerCase()] || ParcelStatus.PENDING;
//   }

//   private parseAddress(addressString: string): Address {
//     // Simple address parsing - in real app, this would be more sophisticated
//     const parts = addressString?.split(',') || ['Unknown Address'];
//     return {
//       street: parts[0]?.trim() || 'Unknown Street',
//       city: parts[1]?.trim() || 'Unknown City',
//       state: parts[2]?.trim() || 'Unknown State',
//       zipCode: parts[3]?.trim() || '00000',
//       country: 'USA'
//     };
//   }

//   // Statistics
//   getParcelStats(): Observable<any> {
//     return new Observable(observer => {
//       const parcels = this.parcelsSubject.value;
//       const stats = {
//         total: parcels.length,
//         pending: parcels.filter(p => p.status === ParcelStatus.PENDING).length,
//         inTransit: parcels.filter(p => p.status === ParcelStatus.IN_TRANSIT).length,
//         delivered: parcels.filter(p => p.status === ParcelStatus.DELIVERED).length,
//         cancelled: parcels.filter(p => p.status === ParcelStatus.CANCELLED).length
//       };
      
//       observer.next(stats);
//       observer.complete();
//     });
//   }

//   deleteAllParcels(): Observable<boolean> {
//     return new Observable(observer => {
//       localStorage.removeItem(this.STORAGE_KEY);
//       this.parcelsSubject.next([]);
//       observer.next(true);
//       observer.complete();
//     });
//   }
// }


// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { Parcel, ParcelStatus } from '../models/parcel.model'; // Adjust path as needed

// @Injectable({
//   providedIn: 'root'
// })
// export class ParcelService {
//   private apiUrl = 'https://localhost:3000/parcels'; // Replace this with your actual base URL

//   constructor(private http: HttpClient) {}

//   getAllParcels(): Observable<Parcel[]> {
//     return this.http.get<Parcel[]>(`${this.apiUrl}`);
//   }

//   getParcelByTrackingNumber(trackingNumber: string): Observable<Parcel> {
//     return this.http.get<Parcel>(`${this.apiUrl}/tracking/${trackingNumber}`);
//   }

//   createParcel(parcel: Parcel): Observable<Parcel> {
//     return this.http.post<Parcel>(`${this.apiUrl}`, parcel);
//   }

//   deleteParcel(id: string): Observable<any> {
//     return this.http.delete(`${this.apiUrl}/${id}`);
//   }

//   deleteAllParcels(): Observable<any> {
//     return this.http.delete(`${this.apiUrl}/all`);
//   }

//   updateParcelStatus(parcelId: string, newStatus: ParcelStatus): Observable<any> {
//     return this.http.patch(`${this.apiUrl}/${parcelId}/status`, { status: newStatus });
//   }

//   getOrders(): Observable<any[]> {
//     return this.http.get<any[]>(`https://localhost:3000/orders`);
//   }

//   updateOrderStatus(orderId: string, newStatus: ParcelStatus, statusReason: string): Observable<any> {
//     return this.http.patch(`https://localhost:3000/orders/${orderId}/status`, { status: newStatus });
//   }

//   convertOrdersToParcels(orders: any[]): Parcel[] {
//     return orders.map(order => ({
//       id: order.id,
//       description: order.description,
//       weight: order.weight,
//       dimensions: order.dimensions,
//       priority: order.priority,
//       status: order.status,
//       sender: order.sender,
//       recipient: order.recipient,
//       courier: order.courier,
//       trackingNumber: order.trackingNumber,
//       cost: order.cost,
//       estimatedDelivery: order.estimatedDelivery,
//       deliveryDetails: order.deliveryDetails,
//       createdAt: order.createdAt,
//       updatedAt: order.updatedAt,
//       statusHistory: order.statusHistory || []
//     }));
//   }

//   refreshData(): Observable<Parcel[]> {
//     return this.getAllParcels();
//   }
// }
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Parcel, ParcelStatus } from '../models/parcel.model';

@Injectable({
  providedIn: 'root'
})
export class ParcelService {
  private apiUrl = 'http://localhost:3000/parcels';
  private orderUrl = 'http://localhost:3000/orders';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllParcels(): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}`, {
      headers: this.getAuthHeaders()
    });
  }

  getParcelByTrackingNumber(trackingNumber: string): Observable<Parcel> {
    return this.http.get<Parcel>(`${this.apiUrl}/track/${trackingNumber}`, {
      headers: this.getAuthHeaders()
    });
  }

  createParcel(parcel: any): Observable<Parcel> {
    return this.http.post<Parcel>(`${this.apiUrl}`, parcel, {
      headers: this.getAuthHeaders()
    });
  }

  deleteParcel(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  deleteAllParcels(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/all`, {
      headers: this.getAuthHeaders()
    });
  }

  updateParcelStatus(parcelId: string, newStatus: ParcelStatus): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${parcelId}`, { status: newStatus }, {
      headers: this.getAuthHeaders()
    });
  }

  getParcelsBySender(senderId: string): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/sender/${senderId}`, {
      headers: this.getAuthHeaders()
    });
  }

  getParcelsByStatus(status: ParcelStatus): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/status/${status}`, {
      headers: this.getAuthHeaders()
    });
  }

  getParcelById(id: string): Observable<Parcel> {
    return this.http.get<Parcel>(`${this.apiUrl}/parcel/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.orderUrl}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateOrderStatus(orderId: string, newStatus: ParcelStatus, statusReason: string): Observable<any> {
    return this.http.patch(`${this.orderUrl}/${orderId}/status`, {
      status: newStatus,
      reason: statusReason
    }, {
      headers: this.getAuthHeaders()
    });
  }

  convertOrdersToParcels(orders: any[]): Parcel[] {
    return orders.map(order => ({
      id: order.id,
      description: order.description,
      weight: order.weight,
      dimensions: order.dimensions,
      priority: order.priority,
      status: order.status,
      sender: order.sender,
      recipient: order.recipient,
      courier: order.courier,
      trackingNumber: order.trackingNumber,
      cost: order.cost,
      estimatedDelivery: order.estimatedDelivery,
      deliveryDetails: order.deliveryDetails,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      statusHistory: order.statusHistory || []
    }));
  }

  refreshData(): Observable<Parcel[]> {
    return this.getAllParcels();
  }
}
