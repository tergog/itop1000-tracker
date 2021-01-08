import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { UsersService } from '../../shared/services/users.service';
import { LocalStorage } from '../../shared/constants/local-storage';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  authForm = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required]
  });

  public errorMessage: string;

  @Output() isAuth: EventEmitter<User> = new EventEmitter<User>();

  constructor(private fb: FormBuilder,
              private usersService: UsersService,
              ) { }

  ngOnInit(): void {
  }

  public onSubmit(): void {
    this.usersService.login(this.authForm.value).subscribe(
      (data) => {
        localStorage.setItem(LocalStorage.TOKEN, data.token);
        this.isAuth.emit(data.user);
      },
      err => this.errorMessage = err.error.message
    );
  }

}
