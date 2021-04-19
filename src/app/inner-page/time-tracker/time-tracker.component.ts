import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject, interval, Subject, Subscription} from 'rxjs';
import {ElectronService} from 'ngx-electron';
import {takeUntil} from 'rxjs/operators';

import {ScreenshotService} from '../../shared/services/screenshot.service';
import {UsersService} from '../../shared/services/users.service';
import {WorkDataService} from '../../shared/services/work-data.service';
import {Project} from '../../shared/models/project.model';
import {ScreenshotModel} from '../../shared/models/screenshot.model';
import {LocalStorage} from '../../shared/constants/local-storage';


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
  public isShowNewScreenshot = true;

  private mousePosition: { x: number, y: number };
  private isTakingScreenshot: boolean;

  private secondCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private nextScreenshotTime: number;
  private workDuration = 0;
  private workPassage: number;

  private workInterval: Subscription;
  public timer: Subscription;
  private startTimeout;

  private destroy$: Subject<void> = new Subject<void>();


  private static getRandomNumber(min, max): number {
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

    this.workPassage = (60 / this.project.screenshotsPerHour) * 60;

    this.workDataService.setWorkTime(this.workPassage, this.project.workTime);
    this.lastScreenshot = this.workDataService.screenshot;

    console.log(this.workDataService.workData);

    this.secondCount$.pipe(takeUntil(this.destroy$)).subscribe((sec: number) => {
      console.log('seconds: ', sec, this.nextScreenshotTime, this.workDataService.workInterval);
      if (sec === this.nextScreenshotTime) {
        !this.isTakingScreenshot && this.takeScreenshot();
      }
    });

    this.electronService.ipcRenderer.on('closing-channel', () => {
      this.usersService.updateWorkTime(this.projectId, this.workDataService.workData).subscribe(() => {
        this.electronService.ipcRenderer.send('closing-channel');
      });
    });

    this.electronService.ipcRenderer.on('events-channel', (event, resp) => {
      console.log('event: ', resp);
      if (event) {
        this.workDataService.addAction(1);
      }
    });

    this.electronService.ipcRenderer.on('screenshot-channel', (event, resp: { status: boolean, screenshot: ScreenshotModel }) => {
      if (resp.status) {
        this.workDataService.addScreenshot(resp.screenshot);
        this.lastScreenshot = resp.screenshot;
      } else {
        this.screenshotService.deleteScreenshot(resp.screenshot.link).subscribe(() => {
        });
        this.workTime -= this.workDataService.workInterval.time;
        this.workDataService.nullifyIntervalTime();
      }
      this.isTakingScreenshot = false;
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.startTimeout);
    this.startTimeout = null;
    this.destroy$.next();
    this.destroy$.complete();
    this.electronService.ipcRenderer.removeAllListeners('screenshot-channel');
    this.electronService.ipcRenderer.removeAllListeners('events-channel');
    this.electronService.ipcRenderer.removeAllListeners('closing-channel');
  }

  public onSlideChange(): void {
    if (!this.timer || this.timer.closed) {
      this.startWorkTime();
    } else {
      this.workDataService.addWorkInterval();
      this.stopWorkTime();
    }
  }

  public startWorkTime(): void {
    this.workDuration = ((60 * 60) - (new Date().getMinutes() * 60) - new Date().getSeconds()) % this.workPassage;

    this.workDataService.setWorkInterval();

    // if time from start of work interval more than time from last screenshot, nextScreenshotTime will set on next work interval
    const fromLastBetween = (this.workPassage - this.workDuration);
    const fromLastScreenshot = this.lastScreenshot ?
      (Date.now() - new Date(this.lastScreenshot.dateCreated).getTime()) / 1000 :
      this.workPassage;
    fromLastBetween > fromLastScreenshot ? this.nextScreenshotTime = -1 : this.setNextScreenshotTime();

    if (!this.workInterval) {
      this.electronService.ipcRenderer.send('events-channel');
      this.workCountdown();
      this.startTimeout = setTimeout(() => {
        this.createWorkInterval();
      }, 1000 * this.workDuration);
    } else {
      this.workCountdown();
    }
    this.isWorking = true;
  }

  public endWorkTime(): void {
    this.isWorking && this.workDataService.addWorkInterval();
    this.timer ? this.stopWorkTime() : this.exitProject.emit();
    this.usersService.updateWorkTime(this.projectId, this.workDataService.workData)
      .subscribe(() => {
        localStorage.removeItem(LocalStorage.ACTIVE_PROJECT_ID);
        this.exitProject.emit();
        this.workDataService.workInterval = null;
      });
  }

  public stopWorkTime(): void {
    this.timer.unsubscribe();
    this.isWorking = false;
    this.workDataService.setSumsOfTime();
    this.workTime = 0;
    this.mousePosition = null;
  }

  private createWorkInterval(): void {
    this.workInterval = interval(1000 * this.workPassage).pipe(takeUntil(this.destroy$)).subscribe(() => {
      console.log('next updateCountdown: ', new Date());
      this.updateCountdown();
    });
    console.log('first updateCountdown: ', new Date());
    this.updateCountdown();
  }

  private updateCountdown(): void {
    if (this.isWorking) {
      !this.workDataService.isWorkIntervalUseless() && this.workDataService.addWorkInterval();
      this.workDataService.updateWorkTimeByDate(new Date());
      this.usersService.updateWorkTime(this.projectId, this.workDataService.workData).subscribe(() => {
      });
      this.workDataService.workInterval = {time: 1000, actions: 0};

      this.timer.unsubscribe();
      this.secondCount$.next(this.workDuration);
      console.log('updateCountdown: ', this.workDataService.workData);

      this.workDuration = this.workPassage;
      this.setNextScreenshotTime();
      this.workCountdown();
    }
  }

  private workCountdown(): void {
    this.timer = interval(1000).pipe(takeUntil(this.destroy$)).subscribe((sec) => {
      this.secondCount$.next(sec + 1);
      this.workTime += 1000;
      this.workDataService.addWorkTime(1000);

      if (sec !== 0 && ((sec + 1) % 60 === 0) || (sec === this.workDuration - 2)) {
        this.electronService.ipcRenderer.send('events-channel');
      }
    });
  }

  private setNextScreenshotTime(): void {
    // workDuration-30 for 30sec on all actions with queries
    const maxNumber = this.workDuration - 30;
    this.nextScreenshotTime = maxNumber <= 31 ? 1 : TimeTrackerComponent.getRandomNumber(30, maxNumber);
  }

  private takeScreenshot(): void {
    this.isTakingScreenshot = true;
    this.screenshotService.takeScreenshot(this.projectId, this.workDataService.workData)
      .subscribe((screenshot: ScreenshotModel) => {
        if (!this.isShowNewScreenshot) {
          this.workDataService.addScreenshot(screenshot);
          this.lastScreenshot = screenshot;
          this.isTakingScreenshot = false;
        }

        // TODO not working
        this.isShowNewScreenshot && this.electronService.ipcRenderer.send('screenshot-channel', screenshot);
      });
  }
}
