import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { Project } from '../shared/models/project.model';
import { LocalStorage } from '../shared/constants/local-storage';
import { UsersService } from '../shared/services/users.service';
import { User } from '../shared/models/user.model';

@Component({
  selector: 'app-inner-page',
  templateUrl: './inner-page.component.html',
  styleUrls: ['./inner-page.component.scss']
})
export class InnerPageComponent implements OnInit {
  @Output() logout: EventEmitter<boolean> = new EventEmitter<boolean>();
  public isStarted: boolean;
  public projects: Project[] = [];
  public project: Project;
  public userId: string;

  constructor(private userService: UsersService) { }

  ngOnInit(): void {
    this.userService.getUserProjects().subscribe((user: User) => {
      this.projects = user.activeProjects;
    });
  }

  public startWork(projectArrayId: number): void {
    localStorage.setItem(LocalStorage.ACTIVE_PROJECT_ID, String(projectArrayId));
    this.project = this.projects[projectArrayId];
    this.isStarted = true;
  }

  public endWork(): void {
    this.isStarted = false;
    this.userService.getUserProjects().subscribe((user: User) => {
      this.projects = user.activeProjects;
    });
  }

  public onLogoutClick(): void {
    this.logout.emit();
  }

}
