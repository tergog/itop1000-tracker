import { Component, EventEmitter, NgZone, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UsersService } from '../../shared/services/users.service';
import { ElectronService } from 'ngx-electron';

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

  @Output() isAuth: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private fb: FormBuilder,
              private usersService: UsersService,
              private electronService: ElectronService,
              private zone: NgZone
              ) { }

  ngOnInit(): void {
  }

  public onSubmit(): void {
    this.electronService.ipcRenderer.send('authenticate', this.authForm.value);
    this.electronService.ipcRenderer.on('authenticate', (event, resp) => {
      this.zone.run(() => {
        localStorage.setItem('token', resp.token);
        this.isAuth.emit(true);
      });
    });
  }

}
