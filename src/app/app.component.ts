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

  public time: number = 0;
  public image: string;

  private nextScreenshotTime: number;
  private screenshotInterval: number;

  constructor(private electronService: ElectronService) {

  }

  ngOnInit(): void {
    this.timeStart = Date.now();
    interval(1000).subscribe(() => {
      if (this.time === this.nextScreenshotTime) {
        // this.takeScreenshot();
      }
      this.time = Date.now() - this.timeStart;
    });
  }

  public takeScreenshot(): void {
    const img = this.robot.screen.capture(0, 0, 64, 64);

    const arrayBuffer = new Uint8Array(img.image);

    console.log(arrayBuffer);


    // const blob = new Blob([new Uint8Array(img.image)], {type: 'application/octet-stream'});
    // const imageUrl = URL.createObjectURL(blob);


    const base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(img.image)));
    this.image = 'data:aplication/octet-stream;base64,' + base64String;


    this.screenshotInterval = this.getRandomNumber(5, 15) * 60 * 1000;
    this.nextScreenshotTime = this.time + this.screenshotInterval;
  }

  private getRandomNumber(min, max): number {
    return Math.random() * (max - min) + min;
  }
}
