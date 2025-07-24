import { Component } from '@angular/core';
import {Navbar} from '../../Shared/navbar/navbar';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-email-verification',
  imports: [
    Navbar,
    ReactiveFormsModule
  ],
  templateUrl: './email-verification.html',
  styleUrl: './email-verification.css'
})
export class EmailVerification {
otpForm:FormGroup;
constructor(private fb:FormBuilder ){
  this.otpForm = this.fb.group ({
    otp:['', Validators.required,Validators.minLength(6),Validators.maxLength(6)]
  });
}
onSubmit(){
  if(this.otpForm.valid) {
    const otpcode=this.otpForm.value.otp;
    console.log('verify Otp', otpcode);
  }
}

resendOtp(){
  console.log('resending otp');
}
}
