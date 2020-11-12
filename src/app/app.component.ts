import { Component, ElementRef, OnInit, ViewChild, ViewRef } from '@angular/core';
import { interval } from 'rxjs';
import { ElectronService } from 'ngx-electron';
import * as robotjs from 'robotjs';
import * as fs from 'fs';
import * as path from 'path';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'time-tracker';

  private robot = this.electronService.remote.require('robotjs');
  private fs = this.electronService.remote.require('fs');

  private timeStart: number;

  public workTime = 0;
  public time: number = 0;
  public image: string;

  private nextScreenshotTime: number = 0;
  private screenshotInterval: number;

  constructor(private electronService: ElectronService) {}

  ngOnInit(): void {
    this.timeStart = Date.now();
    interval(1000).subscribe((sec) => {
      console.log(sec, this.nextScreenshotTime);
      if (this.time === this.nextScreenshotTime) {
        this.takeScreenshot();
      }
      this.time = sec;
      this.workTime = Date.now() - this.timeStart;
    });
  }

  public takeScreenshot(): void {
    // const img = this.robot.screen.capture(0, 0, 64, 64);

    this.robot.keyTap('printscreen');

    this.screenshotInterval = this.getRandomNumber(5, 15) * 60;
    this.nextScreenshotTime = this.time + this.screenshotInterval;
  }

  private getRandomNumber(min, max): number {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }
}
