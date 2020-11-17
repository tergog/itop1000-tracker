import { Component, OnInit } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { ScreenshotService } from '../../services/screenshot.service';
import jwtDecode from 'jwt-decode';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.scss']
})
export class TimeTrackerComponent implements OnInit {

  public workTime = 0;


  private timeStart: number;
  private secondCount: number = 0;
  private nextScreenshotTime: number = 0;
  private screenshotInterval: number = 0;

  private interval: Observable<any>;
  private timer;

  constructor(
    private screenshotService: ScreenshotService) {}

  ngOnInit(): void {
    this.timeStart = Date.now();

    this.interval = interval(1000);

    interval(1000).subscribe((sec) => {
      if (this.secondCount === this.nextScreenshotTime) {
        this.takeScreenshot();
      }
      this.secondCount = sec;
      this.workTime = Date.now() - this.timeStart;
    });

  }

  public startWorkTime() {
    this.timer = this.interval
  }

  public stopWorkTime() {

  }

  public endWorkTime() {

  }

  private takeScreenshot(): void {

    const user: any = jwtDecode(localStorage.getItem('token'));
    const project = user.projects[2];

    this.screenshotService.takeScreenshot(project.employerId, project.title, user.id).pipe(take(1)).subscribe(() => {});

    this.screenshotInterval = this.getRandomNumber(5, 15) * 60;
    this.nextScreenshotTime = this.secondCount + this.screenshotInterval;

  }

  private getRandomNumber(min, max): number {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }

}
