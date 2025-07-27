import { UserRole } from '../../component/Shared/user.model';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../Shared/user.model';
import { Navbar } from '../Shared/navbar/navbar';
import { Footer } from '../Shared/footer/footer';
import { OrderService, Order } from '../../services/order.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './users-info.html',
  imports: [
    ReactiveFormsModule,
    Navbar,
    Footer,
    CommonModule
  ],
  styleUrls: ['./users-info.css']
})
export class UsersInfo {
  parcelForm: FormGroup;

  courierServices = [
    'Express Delivery',
    'Standard Delivery',
    'Same Day Delivery',
    'Next Day Delivery',
    'International Shipping'
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private orderService: OrderService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.parcelForm = this.fb.group({
      senderName: ['', Validators.required],
      senderEmail: ['', [Validators.required, Validators.email]],
      senderPhone: ['', Validators.required],
      senderHometown: ['', Validators.required],
      senderZip: [''],
      receiverName: ['', Validators.required],
      receiverEmail: ['', [Validators.required, Validators.email]],
      receiverPhone: ['', Validators.required],
      receiverHometown: ['', Validators.required],
      receiverZip: [''],
      packageName: ['', Validators.required],
      packageWeight: ['', [Validators.required, Validators.min(0.1)]],
      packageDimensions: [''],
      courierService: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0.01)]],
      notes: ['']
    });
  }

  onSubmit(): void {
    if (this.parcelForm.valid) {
      const formValue = this.parcelForm.value;

      const user: User = {
        name: formValue.senderName,
        email: formValue.senderEmail,
        phone: formValue.senderPhone,
        isVerified: true,
        location: formValue.senderHometown,
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
        goodType: formValue.packageName,
        goodWeight: formValue.packageWeight + ' kg',
        goodPrice: '$' + formValue.price,
        goodDescription: formValue.notes || 'Package order',
        zipcode: formValue.senderZip || '',
        id: ''
      };

      const dto = {
        fullName: user.name,
        email: user.email,
        password: 'TempPass123!', // Ensure valid temporary password
        role: user.role
      };

      const order: Order = {
        orderId: '',
        customerName: formValue.senderName,
        pickupAddress: `${formValue.senderHometown}${formValue.senderZip ? ', ' + formValue.senderZip : ''}`,
        deliveryAddress: `${formValue.receiverHometown}${formValue.receiverZip ? ', ' + formValue.receiverZip : ''}`,
        courierService: formValue.courierService,
        status: 'Pending',
        createdAt: '',
        updatedAt: '',
        packageWeight: formValue.packageWeight + ' kg',
        packageDimensions: formValue.packageDimensions || 'Not specified',
        price: '$' + formValue.price,
        notes: `Package: ${formValue.packageName}. Receiver: ${formValue.receiverName} (${formValue.receiverEmail}, ${formValue.receiverPhone}). ${formValue.notes || ''}`
      };

      this.userService.createUser(dto).subscribe({
        next: (createdUser) => {
          // Add user ID to the order
          order.customerId = createdUser.id;

          this.orderService.createOrder(order).subscribe({
            next: () => {
              this.toastService.success('Order created successfully! Redirecting to orders page...');
              setTimeout(() => this.router.navigate(['/Vieworders']), 2000);
            },
            error: (error) => {
              this.toastService.error('Failed to create order. Please try again.');
              console.error('Order creation error:', error);
            }
          });
        },
        error: (error) => {
          this.toastService.error('Failed to create user. Please check the inputs.');
          console.error('User creation error:', error);
        }
      });

    } else {
      this.toastService.warning('Please fill in all required fields correctly.');
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.parcelForm.controls).forEach(key => {
      const control = this.parcelForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  resetForm(): void {
    this.parcelForm.reset();
  }
}
