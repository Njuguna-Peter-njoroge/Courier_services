import { Component } from '@angular/core';
import {Navbar} from '../../Shared/navbar/navbar';
import {Footer} from '../../Shared/footer/footer';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  imports: [
    Navbar,
    Footer,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.toastr.warning('Please fill in all fields correctly', 'Validation Warning');
      return;
    }

    const { name, email, password, confirmPassword } = this.registerForm.value;

    if (password !== confirmPassword) {
      this.toastr.error('Passwords do not match!', 'Error');
      return;
    }

    // Default role assignment (can be improved as needed)
    let role = 'USER';
    if (email === 'admin@gmail.com' && password === 'Admin@123') {
      role = 'ADMIN';
    }

    this.authService.register({ name, email, password}).subscribe({
      next: () => {
        this.toastr.success(`${role} registered successfully`, 'Success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || 'Registration failed', 'Error');
      }
    });
  }
}
