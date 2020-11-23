import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Project } from '../../shared/models/project.model';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent implements OnInit {

  @Input() project: Project;
  @Input() projectArrayId: number;

  @Output() isStarted: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

  public startWork(projectArrayId: number) {
    this.isStarted.emit(projectArrayId);
  }

}
