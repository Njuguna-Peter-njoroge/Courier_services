import { Injectable } from '@angular/core';
import { User } from '../component/Shared/user.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private STORAGE_KEY = 'users_data';
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor() {
    this.loadUsers();
  }

  private loadUsers(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const users = JSON.parse(stored);
        this.usersSubject.next(users);
      } catch (error) {
        console.error('Error loading users from storage:', error);
        this.initializeDummyUsers();
      }
    } else {
      this.initializeDummyUsers();
    }
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    this.usersSubject.next(users);
  }

  private initializeDummyUsers(): void {
    const dummyUsers: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        isVerified: true,
        location: 'New York, NY',
        role: 'customer',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        goodType: 'Electronics',
        goodWeight: '2.5 kg',
        goodPrice: '$150',
        goodDescription: 'Laptop accessories',
        zipcode: '10001'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1987654321',
        isVerified: false,
        location: 'Los Angeles, CA',
        role: 'courier',
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
        goodType: 'Documents',
        goodWeight: '0.5 kg',
        goodPrice: '$25',
        goodDescription: 'Legal documents',
        zipcode: '90210'
      },
      {
        id: '3',
        name: 'Admin User',
        email: 'admin@express.com',
        phone: '+1555123456',
        isVerified: true,
        location: 'Chicago, IL',
        role: 'admin',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        goodType: 'N/A',
        goodWeight: 'N/A',
        goodPrice: 'N/A',
        goodDescription: 'System administrator',
        zipcode: '60601'
      }
    ];
    this.saveUsers(dummyUsers);
  }

  // CRUD Operations
  getUsers(): User[] {
    return this.usersSubject.value;
  }

  getUsersObservable(): Observable<User[]> {
    return this.users$;
  }

  addUser(user: User): void {
    const users = this.usersSubject.value;
    user.id = this.generateId();
    user.createdAt = new Date();
    user.updatedAt = new Date();
    users.push(user);
    this.saveUsers(users);
  }

  updateUser(updatedUser: User): void {
    const users = this.usersSubject.value;
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      updatedUser.updatedAt = new Date();
      users[index] = updatedUser;
      this.saveUsers(users);
    }
  }

  deleteUser(userId: string): void {
    const users = this.usersSubject.value;
    const filteredUsers = users.filter(u => u.id !== userId);
    this.saveUsers(filteredUsers);
  }

  getUserById(id: string): User | undefined {
    return this.usersSubject.value.find(u => u.id === id);
  }

  private generateId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
