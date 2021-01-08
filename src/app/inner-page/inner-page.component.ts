import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import jwtDecode from 'jwt-decode';

import { Project } from '../shared/models/project.model';
import { LocalStorage } from '../shared/constants/local-storage';

@Component({
  selector: 'app-inner-page',
  templateUrl: './inner-page.component.html',
  styleUrls: ['./inner-page.component.scss']
})
export class InnerPageComponent implements OnInit {
  @Output() logout: EventEmitter<boolean> = new EventEmitter<boolean>();
  public isStarted: boolean;
  public projects: Project[] = [];
  public userId: string;

  constructor() { }

  ngOnInit(): void {
    const userInfo: any = jwtDecode(localStorage.getItem(LocalStorage.TOKEN));
    this.projects = userInfo.activeProjects;
    this.userId = userInfo.id;
  }

  public startWork(projectArrayId: number): void {
    localStorage.setItem(LocalStorage.ACTIVE_PROJECT_ID, String(projectArrayId));
    this.isStarted = true;
  }

  public endWork(): void {
    const userInfo: any = jwtDecode(localStorage.getItem(LocalStorage.TOKEN));
    this.projects = userInfo.activeProjects;
    this.isStarted = false;
  }

  public onLogoutClick(): void {
    this.logout.emit();
  }

}
