import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {MatSlideToggleModule} from '@angular/material/slide-toggle';

import { InnerPageComponent } from './inner-page.component';
import { TimeTrackerComponent } from './time-tracker/time-tracker.component';
import { ProjectCardComponent } from './project-card/project-card.component';

@NgModule({
  declarations: [
    InnerPageComponent,
    TimeTrackerComponent,
    ProjectCardComponent
  ],
  exports: [
    InnerPageComponent
  ],
  imports: [
    CommonModule,
    MatSlideToggleModule
  ]
})
export class InnerPageModule { }
