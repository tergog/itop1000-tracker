import { Component, OnInit } from '@angular/core';

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
    if (this.isAuth) {
    }
  }

  onLogin() {
    this.isAuth = true;
  }

  onLogoutClick() {
    localStorage.removeItem('token');
    this.isAuth = false;
  }


}
