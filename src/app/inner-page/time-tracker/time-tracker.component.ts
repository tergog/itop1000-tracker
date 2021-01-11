import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { ElectronService } from 'ngx-electron';

import { ScreenshotService } from '../../shared/services/screenshot.service';
import { UsersService } from '../../shared/services/users.service';
import { WorkTimeService } from '../../shared/services/work-time.service';
import { Project } from '../../shared/models/project.model';
import { ScreenshotModel } from '../../shared/models/screenshot.model';
import { User } from '../../shared/models/user.model';
import { LocalStorage } from '../../shared/constants/local-storage';


@Component({
  selector: 'app-time-tracker',
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.scss']
})
export class TimeTrackerComponent implements OnInit, OnDestroy {

  @Input() project: Project;
  @Output() exitProject: EventEmitter<boolean> = new EventEmitter<boolean>();

  private projectId: number;
  public lastScreenshot: ScreenshotModel;
  public workTime = 0;
  public isWorking: boolean;

  private secondCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private nextScreenshotTime: number;
  private workDuration = 0;
  private betweenScreenshots: number;

  private workInterval: Subscription;
  public timer: Subscription;


  private static getRandomNumber(min, max): number {
    // todo check random
    return Math.floor(min + Math.random() * (max + 1 - min));
  }

  constructor(
    private electronService: ElectronService,
    private screenshotService: ScreenshotService,
    private usersService: UsersService,
    public workTimeService: WorkTimeService
  ) {
  }

  ngOnInit(): void {
    this.projectId = +localStorage.getItem(LocalStorage.ACTIVE_PROJECT_ID);
    this.lastScreenshot = this.project.screenshots[this.project.screenshots.length - 1];
    this.workTimeService.setWorkTime(this.project.workTime);
    console.log(this.project, this.workTimeService.workTime);

    this.betweenScreenshots = (60 / this.project.screenshotsPerHour) * 60;
    this.workDuration = ( (60 * 60) - (new Date().getMinutes() * 60) - new Date().getSeconds() ) % this.betweenScreenshots;
    console.log(this.betweenScreenshots, this.workDuration);

    this.secondCount$.subscribe((sec: number) => {
      console.log(sec, this.nextScreenshotTime);
      if (sec === this.nextScreenshotTime) {
        this.takeScreenshot();
      }
    });


  }

  ngOnDestroy(): void {
    this.secondCount$ && this.secondCount$.unsubscribe();
    this.workInterval && this.workInterval.unsubscribe();
    this.timer && this.timer.unsubscribe();
  }

  public onSlideChange(): void {
    if (!this.timer || this.timer.closed) {
      this.startWorkTime();
    } else {
      this.stopWorkTime();
    }
  }

  public startWorkTime(): void {
    // if time from start of work interval more than time from last screenshot, nextScreenshotTime will set on next work interval
    const fromLastBetween = (this.betweenScreenshots - this.workDuration);

    const fromLastScreenshot = this.lastScreenshot ? (Date.now() - new Date(this.lastScreenshot.dateCreated).getTime()) / 1000 : 0;

    fromLastBetween > fromLastScreenshot ? this.nextScreenshotTime = -1 : this.setNextScreenshotTime();


    // TODO detect mouse actions
    // this.electronService.ipcRenderer.send('mouse-event-channel', 'on');
    // this.electronService.ipcRenderer.on('mouse-event-channel', (event, resp) => {
    //   // console.log(resp);
    // });


    if (!this.workInterval) {
      this.workCountdown();
      setTimeout(() => {
        this.createWorkInterval();
      }, 1000 * (this.workDuration));
    } else {
      this.workCountdown();
    }
    this.isWorking = true;
  }

  public endWorkTime(): void {
    this.timer ? this.stopWorkTime() : this.exitProject.emit();

    this.workTimeService.addWorkTime(this.workTime);
    this.usersService.updateWorkTime(this.projectId, this.workTimeService.workTime)
      .subscribe(() => {
        localStorage.removeItem(LocalStorage.ACTIVE_PROJECT_ID);
        this.exitProject.emit();
      });
  }

  public stopWorkTime(): void {
    this.timer.unsubscribe();
    this.isWorking = false;

    // TODO for detect mouse actions
    // this.electronService.ipcRenderer.send('mouse-event-channel', 'off');
  }

  private createWorkInterval(): void {
    this.updateCountdown();
    this.workInterval = interval(1000 * this.betweenScreenshots).subscribe(() => {
      this.updateCountdown();
    });
  }

  private workCountdown(): void {
    this.timer = interval(1000).subscribe((sec) => {
      this.secondCount$.next(sec + 2);
      this.workTime += 1000;
      this.workTimeService.addWorkTime(1000);
    });
  }

  private updateCountdown(): void {
    this.timer.unsubscribe();
    this.secondCount$.next(0);

    this.setNextScreenshotTime();
    this.workDuration = this.betweenScreenshots;
    this.isWorking && this.workCountdown();
  }

  private setNextScreenshotTime(): void {
    // workDuration-10 for 10sec on all actions with queries (example: 600 - 10)
    const maxNumber = this.workDuration === this.betweenScreenshots ? this.workDuration - 10 : this.workDuration;
    this.nextScreenshotTime = TimeTrackerComponent.getRandomNumber(1, maxNumber);
  }

  private takeScreenshot(): void {
    this.screenshotService.takeScreenshot(this.projectId, this.workTimeService.workTime)
      .subscribe((user: User) => {
        this.lastScreenshot = user.activeProjects[this.projectId].screenshots[user.activeProjects[this.projectId].screenshots.length - 1];
      });
  }
}
