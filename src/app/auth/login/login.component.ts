import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import jwtDecode from 'jwt-decode';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  authForm = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required]
  })

  @Output() isAuth: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private fb: FormBuilder, private usersService: UsersService) { }

  ngOnInit(): void {
  }

  public onSubmit(): void {
    this.usersService.login(this.authForm.value).subscribe(
      (userInfo) => {
        localStorage.setItem("token", userInfo.token);
        this.isAuth.emit(true);
      },
      error => console.log(error.message));
  }

}
