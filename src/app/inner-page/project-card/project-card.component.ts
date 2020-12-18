import { Component, Input, OnInit } from '@angular/core';
import { Project } from '../../shared/models/project.model';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent implements OnInit {

  @Input() project: Project;
  public weekWorkTime: number = 0;

  constructor() { }

  ngOnInit(): void {
    const weekKeys = Object.keys(this.project.workTime);
    const lastWeekKey = Number(weekKeys[weekKeys.length - 1]);

    for (let day in this.project.workTime[lastWeekKey]) {
      this.weekWorkTime += this.project.workTime[lastWeekKey][day];
    }
  }

}
