import { Component, OnInit } from '@angular/core';
import jwtDecode from 'jwt-decode';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'time-tracker';
  isAuth: boolean = false;

  ngOnInit() {
    this.isAuth = !!localStorage.getItem('token');
  }

  onLogin() {
    this.isAuth = true;
  }

  onLogoutClick() {
    localStorage.removeItem('token');
    this.isAuth = false;
  }


}
