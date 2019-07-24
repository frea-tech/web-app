import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {FormControl, Validators} from '@angular/forms';
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  hide = true;
  signingBtn = 'Login';
  signingChangeBtn = 'Signup';
  constructor(public auth: AuthService) { }
  email = new FormControl('', [Validators.required, Validators.email]);
  name = new FormControl('', [Validators.required]);
  ngOnInit() {
  }

  getErrorMessage() {
    return this.email.hasError('required') ? 'You must enter a value' :
    this.name.hasError('required') ? 'You must enter a value' :
        this.email.hasError('email') ? 'Not a valid email' :
            '';
  }

  signingBtnChanger() {
    if (this.signingBtn.toUpperCase() === 'LOGIN') {
      this.signingBtn = 'Signup';
      this.signingChangeBtn = 'Login';
    } else {
      this.signingBtn = 'Login';
      this.signingChangeBtn = 'Signup';
    }
  }
  signingBtnAction(email: string, password: string) {
    if (this.signingBtn.toUpperCase() === 'LOGIN') {
      this.auth.emailSignin(email, password);
    } else {
      this.auth.emailSignup(email, password);
    }
  }

}
