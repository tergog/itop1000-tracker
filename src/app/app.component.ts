import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';
import { ElectronService } from 'ngx-electron';
import { ScreenshotService } from '../services/screenshot.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'time-tracker';

  public workTime = 0;


  private timeStart: number;
  private secondCount: number = 0;
  private nextScreenshotTime: number = 0;
  private screenshotInterval: number;

  constructor(
    private electronService: ElectronService,
    private screenshotService: ScreenshotService) {}

  ngOnInit(): void {
    this.timeStart = Date.now();

    interval(1000).subscribe((sec) => {
      if (this.secondCount === this.nextScreenshotTime) {
        this.takeScreenshot();
      }
      this.secondCount = sec;
      this.workTime = Date.now() - this.timeStart;
    });
  }

  public takeScreenshot(): void {
    this.screenshotService.takeScreenshot();

    this.screenshotInterval = this.getRandomNumber(5, 15) * 60;
    this.nextScreenshotTime = this.secondCount + this.screenshotInterval;
  }

  private getRandomNumber(min, max): number {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }
}
