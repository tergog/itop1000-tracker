import { Component, Input, OnInit } from '@angular/core';
import { Project } from '../../shared/models/project.model';
import { WorkDataService } from '../../shared/services/work-data.service';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent implements OnInit {

  @Input() project: Project;
  public weekWorkTime = 0;

  constructor(private workTimeService: WorkDataService) { }

  ngOnInit(): void {
    if (this.project.workTime) {
      const lastWeekKey = this.workTimeService.getLastKey(this.project.workTime);
      const startWeek = this.workTimeService.getStartWeek(new Date());

      if (lastWeekKey === startWeek) {
        this.weekWorkTime = this.workTimeService.getSummaryTimeFromObject(this.project.workTime[lastWeekKey]);
      } else {
        this.weekWorkTime = 0;
      }

    } else {
      this.weekWorkTime = 0;
    }
  }

}
