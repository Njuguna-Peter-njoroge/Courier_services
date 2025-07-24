import { Component } from '@angular/core';
import {Navbar} from '../../Shared/navbar/navbar';
import {Footer} from '../../Shared/footer/footer';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';

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
registerForm:FormGroup;


constructor(private fb:FormBuilder, private router:Router){
  this.registerForm = this.fb.group ({
    name:['', Validators.required],
    email:['', [Validators.required,Validators.email]],
    password:['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]

  });
}onSubmit() {
    if (this.registerForm.invalid) {
      alert('Please fill in all fields correctly');
      return;
    }

    const { name, email, password, confirmPassword } = this.registerForm.value;

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = existingUsers.find((u: any) => u.email === email);

    if (userExists) {
      alert('Email already registered!');
      return;
    }

    // 🔐 Assign role internally based on email
    let role = 'user'; // default role

    if (email === 'admin@gmail.com' && password === 'Admin@123') {
      role = 'admin';
    }

    const newUser = { name, email, password, role };

    existingUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));

    alert(`${role.toUpperCase()} registered successfully`);
    this.router.navigate(['/login']);
  }

}
