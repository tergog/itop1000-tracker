import { Component, OnInit } from '@angular/core';

import { LocalStorage } from './shared/constants/local-storage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'front';
  isAuth: boolean;

  constructor() {
  }

  ngOnInit(): void {
    this.isAuth = !!localStorage.getItem(LocalStorage.TOKEN);
  }

  onLogin(): void {
    this.isAuth = true;
  }

  onLogoutClick(): void {
    localStorage.removeItem(LocalStorage.TOKEN);
    this.isAuth = false;
  }

}
