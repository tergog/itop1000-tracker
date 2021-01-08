import { Component, Input, OnInit } from '@angular/core';
import { Project } from '../../shared/models/project.model';
import { WorkTimeService } from '../../shared/services/work-time.service';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent implements OnInit {

  @Input() project: Project;
  public weekWorkTime = 0;

  constructor(private workTimeService: WorkTimeService) { }

  ngOnInit(): void {
    const lastWeekKey = Number(this.workTimeService.getLastKey(this.project.workTime));

    const startWeek = this.workTimeService.getStartWeek();

    if (lastWeekKey === startWeek) {
      for (let day in this.project.workTime[lastWeekKey]) {
        this.weekWorkTime += this.project.workTime[lastWeekKey][day];
      }
    } else {
      this.weekWorkTime = 0;
    }
  }

}
