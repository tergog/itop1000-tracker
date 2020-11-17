import { Component, OnInit } from '@angular/core';
import jwtDecode from 'jwt-decode';

@Component({
  selector: 'app-inner-page',
  templateUrl: './inner-page.component.html',
  styleUrls: ['./inner-page.component.scss']
})
export class InnerPageComponent implements OnInit {

  public isStarted: boolean = false;
  public projects = [];

  constructor() { }

  ngOnInit(): void {
   const userInfo: any = jwtDecode(localStorage.getItem('token'));
   this.projects = userInfo.projects;
  }

  public startWork() {
    this.isStarted = true;
  }

}
