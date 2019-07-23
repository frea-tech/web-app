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
  constructor(public auth: AuthService) { }
  email = new FormControl('', [Validators.required, Validators.email]);

  ngOnInit() {
  }

  getErrorMessage() {
    return this.email.hasError('required') ? 'You must enter a value' :
        this.email.hasError('email') ? 'Not a valid email' :
            '';
  }

}
