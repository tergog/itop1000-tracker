import { Component, EventEmitter, NgZone, OnInit, Output } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import jwtDecode from 'jwt-decode';

import { ScreenshotService } from '../../shared/services/screenshot.service';
import { UsersService } from '../../shared/services/users.service';
import { Project } from '../../shared/models/project.model';
import { ScreenshotModel } from '../../shared/models/screenshot.model';
import { WorkTimeService } from '../../shared/services/work-time.service';
import { ElectronService } from 'ngx-electron';


@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.scss']
})
export class TimeTrackerComponent implements OnInit {
  @Output() endWork: EventEmitter<boolean> = new EventEmitter<boolean>();

  private projectId: number;
  public project: Project;
  public lastScreenshot: ScreenshotModel;
  public workTime = 0;
  public isWorking: boolean;

  private secondCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private nextScreenshotTime: number;
  private screenshotDuration = 0;
  private betweenScreenshots: number;

  private screenshotInterval: Subscription;
  public timer: Subscription;

  constructor(
    private electronService: ElectronService,
    private screenshotService: ScreenshotService,
    private usersService: UsersService,
    public workTimeService: WorkTimeService,
    private zone: NgZone
  ) {
  }


  ngOnInit(): void {
    const user: any = jwtDecode(localStorage.getItem('token'));
    this.projectId = Number(localStorage.getItem('activeProject'));
    this.project = user.activeProjects[this.projectId];
    this.lastScreenshot = this.project.screenshots[this.project.screenshots.length - 1];

    this.workTimeService.setWorkTime(this.project.workTime);

    this.betweenScreenshots = (60 / this.project.screenshotsPerHour);
    this.screenshotDuration = (60 - new Date().getMinutes()) % this.betweenScreenshots;

    this.secondCount$.subscribe(sec => {
      if (sec === this.nextScreenshotTime) {
        this.takeScreenshot();
      }
    });
  }

  public onSlideChange(): void {
    try {
      if (this.timer) {
        this.timer.closed ? this.startWorkTime() : this.stopWorkTime();
      } else {
        this.startWorkTime();
      }
    } catch (e) {
      console.log(e);
    }
  }

  public startWorkTime(): void {

    this.takeScreenshot();

    const fromLastBetween = (this.betweenScreenshots - this.screenshotDuration)
      || (this.betweenScreenshots - ((60 - new Date().getMinutes()) % this.betweenScreenshots));
    const fromLastScreenshot = (Date.now() - new Date(this.lastScreenshot ? this.lastScreenshot.dateCreated : '').getTime()) / 1000 / 60;
    fromLastBetween > fromLastScreenshot ? this.nextScreenshotTime = -1 : this.setNextScreenshotTime();

    // this.electronService.ipcRenderer.send('mouse-event-channel', 'on');
    // this.electronService.ipcRenderer.on('mouse-event-channel', (event, resp) => {
    //   // console.log(resp);
    // });


    if (!this.screenshotInterval) {
      this.workCountdown();
      setTimeout(() => {
        this.createScreenshotInterval();
      }, 1000 * 60 * (this.screenshotDuration));
    } else {
      this.workCountdown();
    }
    this.isWorking = true;
  }

  public endWorkTime(): void {
    this.timer ? this.stopWorkTime() : this.endWork.emit(false);

    this.workTimeService.addWorkTime(this.workTime);

    this.usersService.updateWorkTime(this.projectId, this.workTimeService.workTime)
      .subscribe(userInfo => {
        localStorage.setItem('token', userInfo.response);
        localStorage.removeItem('activeProject');

        if (this.screenshotInterval) {
          this.screenshotInterval.unsubscribe();
        }

        this.endWork.emit(false);
      });
  }

  public stopWorkTime(): void {
    this.timer.unsubscribe();
    this.isWorking = false;
    this.electronService.ipcRenderer.send('mouse-event-channel', 'off');
  }

  private createScreenshotInterval(): void {
    this.updateCountdown();
    this.screenshotInterval = interval(1000 * 60 * this.betweenScreenshots).subscribe(() => {
      this.updateCountdown();
    });
  }

  private workCountdown(): void {
    this.timer = interval(1000).subscribe((sec) => {
      this.secondCount$.next(sec);
      this.workTime += 1000;
      this.workTimeService.addWorkTime(1000);
    });
  }

  private updateCountdown(): void {
    this.timer.unsubscribe();
    this.secondCount$.next(0);

    this.setNextScreenshotTime();
    this.screenshotDuration = this.betweenScreenshots;
    this.isWorking && this.workCountdown();
  }

  private setNextScreenshotTime(): void {
    const maxNumber = this.screenshotDuration === this.betweenScreenshots ? this.screenshotDuration-- : this.screenshotDuration;
    this.nextScreenshotTime = this.getRandomNumber(1, (maxNumber || this.betweenScreenshots - 1)) * 60;
  }

  private takeScreenshot(): void {
    this.screenshotService.takeScreenshot(this.projectId, this.workTimeService.workTime)
      .subscribe(userInfo => {
        localStorage.setItem('token', userInfo.response);

        const user: any = jwtDecode(userInfo.response);
        this.lastScreenshot = user.activeProjects[this.projectId].screenshots[user.activeProjects[this.projectId].screenshots.length - 1];
      });
  }

  private getRandomNumber(min, max): number {
    const rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }
}
