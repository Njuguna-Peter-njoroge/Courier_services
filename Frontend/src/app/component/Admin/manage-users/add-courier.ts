import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../../Shared/navbar/navbar';
import { Footer } from '../../Shared/footer/footer';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-add-courier',
  standalone: true,
  imports: [Navbar, Footer, ReactiveFormsModule],
  templateUrl: './add-courier.html',
  styleUrl: './manage-users.css'
})
export class AddCourier {
  courierForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {
    this.courierForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      licenseNumber: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.courierForm.invalid) return;
    const courier = {
      ...this.courierForm.value,
      role: 'courier',
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false
    };
    this.userService.addUser(courier);
    this.router.navigate(['/ManageUsers']);
  }
}
