import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsComponent } from './projects.component';
import { ProjectCardComponent } from './project-card/project-card.component';
import { TasksComponent } from './tasks/tasks.component';
import { TaskCardComponent } from './tasks/task-card/task-card.component';



@NgModule({
  declarations: [
    ProjectsComponent,
    ProjectCardComponent,
    TasksComponent,
    TaskCardComponent
  ],
  exports: [
    ProjectsComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ProjectsModule { }
