import { Component, OnInit } from '@angular/core';
import jwtDecode from 'jwt-decode';

@Component({
  selector: 'app-inner-page',
  templateUrl: './inner-page.component.html',
  styleUrls: ['./inner-page.component.css']
})
export class InnerPageComponent implements OnInit {

  public projects = [];

  constructor() { }

  ngOnInit(): void {
   const userInfo: any = jwtDecode(localStorage.getItem('token'));
   this.projects = userInfo.projects;
  }

}
