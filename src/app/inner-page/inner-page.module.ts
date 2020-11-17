import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InnerPageComponent } from './inner-page.component';
import { ProjectsModule } from './projects/projects.module';
import { TimeTrackerComponent } from './time-tracker/time-tracker.component';



@NgModule({
  declarations: [
    InnerPageComponent,
    TimeTrackerComponent
  ],
  exports: [
    InnerPageComponent
  ],
  imports: [
    CommonModule,
    ProjectsModule
  ]
})
export class InnerPageModule { }
