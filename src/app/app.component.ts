import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'time-tracker';
  isAuth: boolean = false;

  constructor(private electronService: ElectronService) {
  }

  ngOnInit() {
    this.isAuth = !!localStorage.getItem('token');
    if (this.isAuth) {
      this.electronService.ipcRenderer.send('onLogin')
    }
  }

  onLogin() {
    this.isAuth = true;
  }

  onLogoutClick() {
    localStorage.removeItem('token');
    this.electronService.ipcRenderer.send('onLogout')
    this.isAuth = false;
  }


}
