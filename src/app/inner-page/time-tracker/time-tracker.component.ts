import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { interval, Observable } from 'rxjs';
import jwtDecode from 'jwt-decode';

import { ScreenshotService } from '../../shared/services/screenshot.service';
import { UsersService } from '../../shared/services/users.service';


@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.scss']
})
export class TimeTrackerComponent implements OnInit {
  @Output() isWorking: EventEmitter<boolean> = new EventEmitter<boolean>();
  projectId: number;
  public workTime = 0;

  private secondCount: number = 0;
  private nextScreenshotTime: number;
  private screenshotInterval: number = 0;

  private interval$: Observable<any>;
  private timer;

  //workHours : 2124363
  // interval : 495

  constructor(
    private screenshotService: ScreenshotService,
    private usersService: UsersService,
    ) {}

  ngOnInit(): void {

    const user: any = jwtDecode(localStorage.getItem('token'));
    this.projectId = Number(localStorage.getItem('activeProject'));
    this.nextScreenshotTime = user.projects[this.projectId].interval || TimeTrackerComponent.getRandomNumber(5, 15) * 60;
    // this.usersService.updateWorkTime(this.projectId, 0, this.nextScreenshotTime)
    //   .subscribe(userInfo => {
    //     localStorage.setItem('token', userInfo.response);
    //   });
    this.interval$ = interval(1000);
    this.startWorkTime();
  }

  public startWorkTime() {
    this.timer = this.interval$.subscribe((sec) => {
      if (this.secondCount === this.nextScreenshotTime) {
        this.takeScreenshot();
      }
      this.secondCount = sec;
      this.workTime += 1000;
    });
  }

  public endWorkTime() {
    this.stopWorkTime();

    this.usersService.updateWorkTime(this.projectId, this.workTime, this.nextScreenshotTime)
      .subscribe(userInfo => {
        localStorage.setItem('token', userInfo.response);
        localStorage.removeItem('activeProject');
        this.isWorking.emit(false);
      });
  }

  public stopWorkTime() {
    this.timer.unsubscribe();
    this.nextScreenshotTime = this.nextScreenshotTime - this.secondCount;
  }

  private takeScreenshot(): void {
    this.screenshotInterval = TimeTrackerComponent.getRandomNumber(5, 15) * 60;
    this.nextScreenshotTime = this.secondCount + this.screenshotInterval;

    this.screenshotService.takeScreenshot(this.projectId, this.workTime, this.screenshotInterval )
      .subscribe(userInfo => {
        localStorage.setItem('token', userInfo.response);
    });
  }

  private static getRandomNumber(min, max): number {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }

}
