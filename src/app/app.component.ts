import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';

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
    this.isAuth = !!localStorage.getItem('token');
  }

  onLogin(): void {
    this.isAuth = true;
  }

  onLogoutClick(): void {
    localStorage.removeItem('token');
    this.isAuth = false;
  }

}
