import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { ElectronService } from 'ngx-electron';

import { ScreenshotService } from '../../shared/services/screenshot.service';
import { UsersService } from '../../shared/services/users.service';
import { WorkDataService } from '../../shared/services/work-data.service';
import { Project } from '../../shared/models/project.model';
import { ScreenshotModel } from '../../shared/models/screenshot.model';
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

  private mousePosition: {x: number, y: number};

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
    public workDataService: WorkDataService
  ) {
  }

  ngOnInit(): void {
    this.projectId = +localStorage.getItem(LocalStorage.ACTIVE_PROJECT_ID);

    this.betweenScreenshots = (60 / this.project.screenshotsPerHour) * 60;
    this.workDuration = ( (60 * 60) - (new Date().getMinutes() * 60) - new Date().getSeconds() ) % this.betweenScreenshots;

    this.workDataService.setWorkTime(this.betweenScreenshots, this.project.workTime);
    this.lastScreenshot = this.workDataService.screenshotLink;

    this.secondCount$.subscribe((sec: number) => {
      console.log('seconds: ', sec, this.nextScreenshotTime);
      if (sec === this.nextScreenshotTime) {
        this.takeScreenshot();
      }
    });

    this.electronService.ipcRenderer.on('mouse-event-channel', (event, resp) => {
      console.log('mouse-event: ', resp, this.mousePosition, resp.x !== this.mousePosition.x || resp.y !== this.mousePosition.y );
      (resp.x !== this.mousePosition.x || resp.y !== this.mousePosition.y) && this.workDataService.addAction(1);
      this.mousePosition = resp;
    });

    this.electronService.ipcRenderer.on('screenshot-channel', (event, resp: ScreenshotModel) => {
      console.log(resp);
      if (resp) {
        this.workDataService.addScreenshot(resp);
        this.lastScreenshot = resp;
        console.log(this.lastScreenshot);
      } else {
        this.workDataService.deleteScreenshot();
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

    if (this.workDuration !== this.betweenScreenshots) {
      this.workDuration = ( (60 * 60) - (new Date().getMinutes() * 60) - new Date().getSeconds() ) % this.betweenScreenshots;
    }

    // if time from start of work interval more than time from last screenshot, nextScreenshotTime will set on next work interval
    const fromLastBetween = (this.betweenScreenshots - this.workDuration);
    const fromLastScreenshot = this.lastScreenshot ? (Date.now() - new Date(this.lastScreenshot.dateCreated).getTime()) / 1000 : 0;
    fromLastBetween > fromLastScreenshot ? this.nextScreenshotTime = -1 : this.setNextScreenshotTime();

    if (!this.workInterval) {
      this.workCountdown();
      setTimeout(() => {
        this.createWorkInterval();
      }, 1000 * this.workDuration);
    } else {
      this.workCountdown();
    }
    this.isWorking = true;
  }

  public endWorkTime(): void {
    this.timer ? this.stopWorkTime() : this.exitProject.emit();

    this.usersService.updateWorkTime(this.projectId, this.workDataService.workTime)
      .subscribe(() => {
        localStorage.removeItem(LocalStorage.ACTIVE_PROJECT_ID);
        this.exitProject.emit();
      });
  }

  public stopWorkTime(): void {
    this.timer.unsubscribe();
    this.isWorking = false;
  }

  private createWorkInterval(): void {
    this.updateCountdown();
    this.workInterval = interval(1000 * this.betweenScreenshots).subscribe((i) => {
      if (i > 0 && this.isWorking) {
        this.workDataService.addWorkTime(1000);
      }
      this.updateCountdown();
      this.usersService.updateWorkTime(this.projectId, this.workDataService.workTime).subscribe(() => {});
    });
  }

  private updateCountdown(): void {
    this.timer.unsubscribe();
    this.secondCount$.next(this.workDuration);
    console.log('updateCountdown: ', this.workDataService.workTime);

    this.setNextScreenshotTime();
    this.workDuration = this.betweenScreenshots;
    this.isWorking && this.workCountdown();
  }

  private workCountdown(): void {
    this.timer = interval(1000).subscribe((sec) => {
      this.secondCount$.next(sec + 1);
      this.workTime += 1000;
      this.workDataService.addWorkTime(1000);

      // TODO detect mouse actions
      if (sec !== 0 && sec % 60 === 0) {
        this.electronService.ipcRenderer.send('mouse-event-channel', this.mousePosition);
      }
    });
  }

  private setNextScreenshotTime(): void {
    // TODO set correct value on last minutes
    // workDuration-30 for 30sec on all actions with queries (example: 600 - 30)
    const maxNumber = this.workDuration === this.betweenScreenshots ? this.workDuration - 30 : this.workDuration;
    this.nextScreenshotTime = TimeTrackerComponent.getRandomNumber(1, maxNumber);
  }

  private takeScreenshot(): void {
    this.screenshotService.takeScreenshot(this.projectId, this.workDataService.workTime)
      .subscribe((screenshot: ScreenshotModel) => {
        this.electronService.ipcRenderer.send('screenshot-channel', screenshot);
      });
  }
}
