import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { interval, Observable, Subscription } from 'rxjs';
import jwtDecode from 'jwt-decode';

import { ScreenshotService } from '../../shared/services/screenshot.service';
import { UsersService } from '../../shared/services/users.service';
import { Project } from '../../shared/models/project.model';


@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.scss']
})
export class TimeTrackerComponent implements OnInit {
  @Output() endWork: EventEmitter<boolean> = new EventEmitter<boolean>();

  projectId: number;
  public project: Project;
  public workTime = 0;
  public isWorking: boolean;

  private secondCount: number = 0;
  private nextScreenshotTime: number;
  private screenshotInterval: number = 0;

  private interval$: Observable<any>;
  public timer: Subscription;

  constructor(
    private screenshotService: ScreenshotService,
    private usersService: UsersService,
    ) {}

  ngOnInit(): void {
    const user: any = jwtDecode(localStorage.getItem('token'));
    console.log(user);

    this.projectId = Number(localStorage.getItem('activeProject'));
    this.project = user.projects[this.projectId];

    this.nextScreenshotTime = user.projects[this.projectId].interval || this.getRandomNumber(5, 15) * 60;

    this.usersService.updateWorkTime(this.projectId, 0, this.nextScreenshotTime)
      .subscribe(userInfo => {
        localStorage.setItem('token', userInfo.response);
      });
    this.interval$ = interval(1000);
  }

  public startWorkTime() {
    this.timer = this.interval$.subscribe((sec) => {
      if (this.secondCount === this.nextScreenshotTime) {
        this.takeScreenshot();
      }
      this.secondCount = sec;
      this.workTime += 1000;
    });

    this.isWorking = true;
  }

  public endWorkTime() {
    this.timer ? this.stopWorkTime() : this.endWork.emit(false);

    this.usersService.updateWorkTime(this.projectId, this.workTime, this.nextScreenshotTime)
      .subscribe(userInfo => {
        localStorage.setItem('token', userInfo.response);
        localStorage.removeItem('activeProject');
        this.endWork.emit(false);
      });
  }

  public stopWorkTime() {
    this.timer.unsubscribe();
    this.nextScreenshotTime = this.nextScreenshotTime - this.secondCount;
    this.isWorking = false;
  }

  public onSlideChange() {
    if (this.timer) {
      this.timer.closed ? this.startWorkTime() : this.stopWorkTime();
    } else {
      this.startWorkTime()
    }
  }

  private takeScreenshot(): void {
    this.screenshotInterval = this.getRandomNumber(5, 15) * 60;
    this.nextScreenshotTime = this.secondCount + this.screenshotInterval;

    this.screenshotService.takeScreenshot(this.projectId, this.workTime, this.screenshotInterval )
      .subscribe(userInfo => {
        localStorage.setItem('token', userInfo.response);
    });
  }

  private getRandomNumber(min, max): number {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }

}
