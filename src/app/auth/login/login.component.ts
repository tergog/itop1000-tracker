import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UsersService } from '../../shared/services/users.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  authForm = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required]
  })

  public errorMessage: string;

  @Output() isAuth: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private fb: FormBuilder,
              private usersService: UsersService) { }

  ngOnInit(): void {
  }

  public onSubmit(): void {
    this.usersService.login(this.authForm.value).subscribe(
      (userInfo) => {
        localStorage.setItem("token", userInfo.token);
        this.isAuth.emit(true);
      },
      err => this.errorMessage = err.error.message
    );
  }

}
