import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';
import { Parcel, ParcelStatus, Priority, ParcelFilter, StatusChange, UserInfo, CourierInfo, Address, DeliveryInfo } from '../models/parcel.model';

@Injectable({
  providedIn: 'root'
})
export class ParcelService {
  private parcelsSubject = new BehaviorSubject<Parcel[]>([]);
  public parcels$ = this.parcelsSubject.asObservable();

  private readonly STORAGE_KEY = 'parcels_data';

  constructor() {
    this.loadParcels();
  }

  private loadParcels(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    let parcels: Parcel[] = [];
    
    if (stored) {
      try {
        parcels = JSON.parse(stored);
        console.log('Loaded parcels from storage:', parcels.length);
      } catch (error) {
        console.error('Error loading parcels from storage:', error);
        this.initializeDummyData();
        return;
      }
    } else {
      this.initializeDummyData();
      return;
    }
    
    // Also load orders from OrderService and convert them to parcels
    const ordersStored = localStorage.getItem('orders');
    if (ordersStored) {
      try {
        const orders = JSON.parse(ordersStored);
        console.log('Loaded orders from storage:', orders.length);
        const convertedParcels = this.convertOrdersToParcels(orders);
        console.log('Converted orders to parcels:', convertedParcels.length);
        parcels = [...parcels, ...convertedParcels];
        // Clear orders from localStorage to prevent duplication
        localStorage.removeItem('orders');
      } catch (error) {
        console.error('Error loading orders from storage:', error);
      }
    }
    
    this.parcelsSubject.next(parcels);
  }

  private saveParcels(parcels: Parcel[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(parcels));
    this.parcelsSubject.next(parcels);
  }

  private initializeDummyData(): void {
    const dummyParcels: Parcel[] = [
      {
        id: '1',
        trackingNumber: 'EXP001234',
        status: ParcelStatus.IN_TRANSIT,
        sender: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          }
        },
        recipient: {
          id: 'user2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1987654321',
          address: {
            street: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
            country: 'USA'
          }
        },
        courier: {
          id: 'courier1',
          name: 'Mike Wilson',
          email: 'mike@express.com',
          phone: '+1555123456',
          vehicleType: 'Van',
          isAvailable: true,
          currentLocation: 'Downtown LA'
        },
        createdAt: new Date('2024-01-15T10:30:00'),
        updatedAt: new Date('2024-01-16T14:20:00'),
        statusHistory: [
          {
            status: ParcelStatus.PENDING,
            timestamp: new Date('2024-01-15T10:30:00'),
            updatedBy: 'system',
            reason: 'Order created'
          },
          {
            status: ParcelStatus.CONFIRMED,
            timestamp: new Date('2024-01-15T11:00:00'),
            updatedBy: 'admin',
            reason: 'Payment confirmed'
          },
          {
            status: ParcelStatus.PICKED_UP,
            timestamp: new Date('2024-01-15T15:30:00'),
            updatedBy: 'courier1',
            reason: 'Package picked up from sender'
          },
          {
            status: ParcelStatus.IN_TRANSIT,
            timestamp: new Date('2024-01-16T09:00:00'),
            updatedBy: 'courier1',
            reason: 'Package in transit to destination'
          }
        ],
        deliveryDetails: {
          pickupAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          deliveryAddress: {
            street: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
            country: 'USA'
          },
          pickupTime: new Date('2024-01-15T15:30:00'),
          specialInstructions: 'Handle with care - fragile items',
          signatureRequired: true
        },
        weight: 2.5,
        dimensions: '30x20x15 cm',
        description: 'Electronics package',
        priority: Priority.HIGH,
        estimatedDelivery: new Date('2024-01-18T16:00:00'),
        cost: 25.99
      },
      {
        id: '2',
        trackingNumber: 'EXP001235',
        status: ParcelStatus.DELIVERED,
        sender: {
          id: 'user3',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          phone: '+1234567891',
          address: {
            street: '789 Pine St',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'USA'
          }
        },
        recipient: {
          id: 'user4',
          name: 'Bob Brown',
          email: 'bob@example.com',
          phone: '+1987654322',
          address: {
            street: '321 Elm St',
            city: 'Miami',
            state: 'FL',
            zipCode: '33101',
            country: 'USA'
          }
        },
        courier: {
          id: 'courier2',
          name: 'Sarah Davis',
          email: 'sarah@express.com',
          phone: '+1555123457',
          vehicleType: 'Motorcycle',
          isAvailable: true,
          currentLocation: 'Miami Beach'
        },
        createdAt: new Date('2024-01-10T09:15:00'),
        updatedAt: new Date('2024-01-12T11:45:00'),
        statusHistory: [
          {
            status: ParcelStatus.PENDING,
            timestamp: new Date('2024-01-10T09:15:00'),
            updatedBy: 'system',
            reason: 'Order created'
          },
          {
            status: ParcelStatus.CONFIRMED,
            timestamp: new Date('2024-01-10T10:00:00'),
            updatedBy: 'admin',
            reason: 'Payment confirmed'
          },
          {
            status: ParcelStatus.PICKED_UP,
            timestamp: new Date('2024-01-10T14:30:00'),
            updatedBy: 'courier2',
            reason: 'Package picked up'
          },
          {
            status: ParcelStatus.IN_TRANSIT,
            timestamp: new Date('2024-01-11T08:00:00'),
            updatedBy: 'courier2',
            reason: 'In transit'
          },
          {
            status: ParcelStatus.OUT_FOR_DELIVERY,
            timestamp: new Date('2024-01-12T09:00:00'),
            updatedBy: 'courier2',
            reason: 'Out for delivery'
          },
          {
            status: ParcelStatus.DELIVERED,
            timestamp: new Date('2024-01-12T11:45:00'),
            updatedBy: 'courier2',
            reason: 'Successfully delivered',
            notes: 'Delivered to recipient at front door'
          }
        ],
        deliveryDetails: {
          pickupAddress: {
            street: '789 Pine St',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'USA'
          },
          deliveryAddress: {
            street: '321 Elm St',
            city: 'Miami',
            state: 'FL',
            zipCode: '33101',
            country: 'USA'
          },
          pickupTime: new Date('2024-01-10T14:30:00'),
          deliveryTime: new Date('2024-01-12T11:45:00'),
          specialInstructions: 'Leave at front door if no answer',
          signatureRequired: false
        },
        weight: 1.2,
        dimensions: '25x15x10 cm',
        description: 'Documents package',
        priority: Priority.NORMAL,
        estimatedDelivery: new Date('2024-01-12T12:00:00'),
        actualDelivery: new Date('2024-01-12T11:45:00'),
        cost: 15.50
      },
      {
        id: '3',
        trackingNumber: 'EXP001236',
        status: ParcelStatus.PENDING,
        sender: {
          id: 'user5',
          name: 'Charlie Wilson',
          email: 'charlie@example.com',
          phone: '+1234567892',
          address: {
            street: '555 Broadway',
            city: 'Seattle',
            state: 'WA',
            zipCode: '98101',
            country: 'USA'
          }
        },
        recipient: {
          id: 'user6',
          name: 'Diana Prince',
          email: 'diana@example.com',
          phone: '+1987654323',
          address: {
            street: '777 Market St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
            country: 'USA'
          }
        },
        createdAt: new Date('2024-01-20T16:45:00'),
        updatedAt: new Date('2024-01-20T16:45:00'),
        statusHistory: [
          {
            status: ParcelStatus.PENDING,
            timestamp: new Date('2024-01-20T16:45:00'),
            updatedBy: 'system',
            reason: 'Order created - awaiting payment confirmation'
          }
        ],
        deliveryDetails: {
          pickupAddress: {
            street: '555 Broadway',
            city: 'Seattle',
            state: 'WA',
            zipCode: '98101',
            country: 'USA'
          },
          deliveryAddress: {
            street: '777 Market St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
            country: 'USA'
          },
          specialInstructions: 'Call before delivery',
          signatureRequired: true
        },
        weight: 3.8,
        dimensions: '40x30x20 cm',
        description: 'Gift package',
        priority: Priority.URGENT,
        estimatedDelivery: new Date('2024-01-22T10:00:00'),
        cost: 35.75
      }
    ];

    this.saveParcels(dummyParcels);
  }

  // CRUD Operations
  getAllParcels(): Observable<Parcel[]> {
    return this.parcels$.pipe(delay(500)); // Simulate API delay
  }

  // Method to refresh data (reload both parcels and orders)
  refreshData(): void {
    this.loadParcels();
  }

  getParcelById(id: string): Observable<Parcel | undefined> {
    return new Observable(observer => {
      const parcels = this.parcelsSubject.value;
      const parcel = parcels.find(p => p.id === id);
      observer.next(parcel);
      observer.complete();
    });
  }

  createParcel(parcel: Omit<Parcel, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Observable<Parcel> {
    return new Observable(observer => {
      const parcels = this.parcelsSubject.value;
      const newParcel: Parcel = {
        ...parcel,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        statusHistory: [{
          status: parcel.status,
          timestamp: new Date(),
          updatedBy: 'admin',
          reason: 'Parcel created'
        }]
      };
      
      const updatedParcels = [...parcels, newParcel];
      this.saveParcels(updatedParcels);
      observer.next(newParcel);
      observer.complete();
    });
  }

  updateParcel(id: string, updates: Partial<Parcel>): Observable<Parcel | null> {
    return new Observable(observer => {
      const parcels = this.parcelsSubject.value;
      const index = parcels.findIndex(p => p.id === id);
      
      if (index !== -1) {
        const updatedParcel = {
          ...parcels[index],
          ...updates,
          updatedAt: new Date()
        };
        
        parcels[index] = updatedParcel;
        this.saveParcels(parcels);
        observer.next(updatedParcel);
      } else {
        observer.next(null);
      }
      observer.complete();
    });
  }

  updateParcelStatus(id: string, status: ParcelStatus, reason?: string, updatedBy: string = 'admin'): Observable<boolean> {
    return new Observable(observer => {
      const parcels = this.parcelsSubject.value;
      const parcel = parcels.find(p => p.id === id);
      
      if (parcel) {
        const statusChange: StatusChange = {
          status,
          timestamp: new Date(),
          updatedBy,
          reason: reason || `Status updated to ${status}`
        };
        
        parcel.status = status;
        parcel.updatedAt = new Date();
        parcel.statusHistory.push(statusChange);
        
        this.saveParcels(parcels);
        observer.next(true);
      } else {
        observer.next(false);
      }
      observer.complete();
    });
  }

  deleteParcel(id: string): Observable<boolean> {
    return new Observable(observer => {
      const parcels = this.parcelsSubject.value;
      const filteredParcels = parcels.filter(p => p.id !== id);
      
      if (filteredParcels.length < parcels.length) {
        this.saveParcels(filteredParcels);
        observer.next(true);
      } else {
        observer.next(false);
      }
      observer.complete();
    });
  }

  filterParcels(filter: ParcelFilter): Observable<Parcel[]> {
    return new Observable(observer => {
      let parcels = this.parcelsSubject.value;
      
      if (filter.status) {
        parcels = parcels.filter(p => p.status === filter.status);
      }
      
      if (filter.priority) {
        parcels = parcels.filter(p => p.priority === filter.priority);
      }
      
      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        parcels = parcels.filter(p => 
          p.trackingNumber.toLowerCase().includes(term) ||
          p.sender.name.toLowerCase().includes(term) ||
          p.recipient.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
        );
      }
      
      if (filter.dateFrom) {
        parcels = parcels.filter(p => new Date(p.createdAt) >= filter.dateFrom!);
      }
      
      if (filter.dateTo) {
        parcels = parcels.filter(p => new Date(p.createdAt) <= filter.dateTo!);
      }
      
      if (filter.courierId) {
        parcels = parcels.filter(p => p.courier?.id === filter.courierId);
      }
      
      observer.next(parcels);
      observer.complete();
    });
  }

  private generateId(): string {
    return 'parcel_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private convertOrdersToParcels(orders: any[]): Parcel[] {
    return orders.map(order => {
      const parcel: Parcel = {
        id: order.orderId || this.generateId(),
        trackingNumber: order.orderId || 'ORD' + Date.now(),
        status: this.mapOrderStatusToParcelStatus(order.status),
        sender: {
          id: 'sender_' + order.orderId,
          name: order.customerName || 'Unknown Sender',
          email: 'sender@example.com',
          phone: '+1234567890',
          address: this.parseAddress(order.pickupAddress)
        },
        recipient: {
          id: 'recipient_' + order.orderId,
          name: 'Recipient',
          email: 'recipient@example.com',
          phone: '+1987654321',
          address: this.parseAddress(order.deliveryAddress)
        },
        createdAt: new Date(order.createdAt || Date.now()),
        updatedAt: new Date(order.updatedAt || Date.now()),
        statusHistory: [{
          status: this.mapOrderStatusToParcelStatus(order.status),
          timestamp: new Date(order.createdAt || Date.now()),
          updatedBy: 'system',
          reason: 'Order converted to parcel'
        }],
        deliveryDetails: {
          pickupAddress: this.parseAddress(order.pickupAddress),
          deliveryAddress: this.parseAddress(order.deliveryAddress),
          specialInstructions: order.notes || '',
          signatureRequired: false
        },
        weight: parseFloat(order.packageWeight) || 1.0,
        dimensions: order.packageDimensions || '20x15x10 cm',
        description: order.courierService || 'Standard delivery',
        priority: Priority.NORMAL,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        cost: parseFloat(order.price) || 0
      };
      return parcel;
    });
  }

  private mapOrderStatusToParcelStatus(orderStatus: string): ParcelStatus {
    const statusMap: { [key: string]: ParcelStatus } = {
      'pending': ParcelStatus.PENDING,
      'confirmed': ParcelStatus.CONFIRMED,
      'picked_up': ParcelStatus.PICKED_UP,
      'in_transit': ParcelStatus.IN_TRANSIT,
      'delivered': ParcelStatus.DELIVERED,
      'cancelled': ParcelStatus.CANCELLED
    };
    return statusMap[orderStatus?.toLowerCase()] || ParcelStatus.PENDING;
  }

  private parseAddress(addressString: string): Address {
    // Simple address parsing - in real app, this would be more sophisticated
    const parts = addressString?.split(',') || ['Unknown Address'];
    return {
      street: parts[0]?.trim() || 'Unknown Street',
      city: parts[1]?.trim() || 'Unknown City',
      state: parts[2]?.trim() || 'Unknown State',
      zipCode: parts[3]?.trim() || '00000',
      country: 'USA'
    };
  }

  // Statistics
  getParcelStats(): Observable<any> {
    return new Observable(observer => {
      const parcels = this.parcelsSubject.value;
      const stats = {
        total: parcels.length,
        pending: parcels.filter(p => p.status === ParcelStatus.PENDING).length,
        inTransit: parcels.filter(p => p.status === ParcelStatus.IN_TRANSIT).length,
        delivered: parcels.filter(p => p.status === ParcelStatus.DELIVERED).length,
        cancelled: parcels.filter(p => p.status === ParcelStatus.CANCELLED).length
      };
      
      observer.next(stats);
      observer.complete();
    });
  }

  deleteAllParcels(): Observable<boolean> {
    return new Observable(observer => {
      localStorage.removeItem(this.STORAGE_KEY);
      this.parcelsSubject.next([]);
      observer.next(true);
      observer.complete();
    });
  }
}
