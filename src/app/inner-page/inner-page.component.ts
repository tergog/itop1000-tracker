import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import jwtDecode from 'jwt-decode';
import { Project } from '../shared/models/project.model';

@Component({
  selector: 'app-inner-page',
  templateUrl: './inner-page.component.html',
  styleUrls: ['./inner-page.component.scss']
})
export class InnerPageComponent implements OnInit {
  @Output() logout: EventEmitter<boolean> = new EventEmitter<boolean>();
  public isStarted: boolean = false;
  public projects: Project[] = [];
  public userId: string;

  constructor() { }

  ngOnInit(): void {
   const userInfo: any = jwtDecode(localStorage.getItem('token'));
   this.projects = userInfo.activeProjects;
   this.userId = userInfo.id;
  }

  public startWork(projectArrayId: number) {
    localStorage.setItem('activeProject', String(projectArrayId))
    this.isStarted = true;
  }

  public endWork() {
    const userInfo: any = jwtDecode(localStorage.getItem('token'));
    this.projects = userInfo.activeProjects;
    this.isStarted = false;
  }

  public onLogoutClick() {
    this.logout.emit();
  }

}
