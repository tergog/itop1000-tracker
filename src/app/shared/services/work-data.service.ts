import { Injectable } from '@angular/core';

import { WorkDataModel, WorkIntervalModel } from '../models/work-data.model';
import { ScreenshotModel } from '../models/screenshot.model';

@Injectable({
  providedIn: 'root'
})
export class WorkDataService {
  public workData: WorkDataModel = {};
  public today = 0;
  public week = 0;
  public interval = 0;

  public screenshot: ScreenshotModel;
  public workInterval: WorkIntervalModel;

  private startWeek: number;
  private startDay: number;
  private startHour: number;

  public lastWeekKey: number;
  public lastDayKey: number;
  public lastHourKey: number;
  public lastIntervalKey: number;


  public setWorkTime(interval: number, workTimeObject?: WorkDataModel): void {
    this.setStartTimeValues();
    this.setInterval(interval);

    (!workTimeObject || this.isObjectEmpty(workTimeObject)) ? this.createWorkTimeObject() : this.workData = workTimeObject;

    this.lastWeekKey = this.getLastKey(this.workData);
    this.lastDayKey = this.getLastKey(this.workData[this.lastWeekKey]);
    this.lastHourKey = this.getLastKey(this.workData[this.lastWeekKey][this.lastDayKey]);
    this.lastIntervalKey = this.getLastKey(this.workData[this.lastWeekKey][this.lastDayKey][this.lastHourKey]);

    this.setLastScreenshot(this.workData);
    this.updateWorkTimeByDate(new Date());
    this.setSumsOfTime();
  }

  public setInterval(sec: number): void {
    this.interval = sec;
  }


  public addWorkTime(sec: number): void {
    this.workInterval.time += sec;
  }


  // action

  public addAction(action: number): void {
    this.workInterval.actions += action;
  }


  // screenshot

  public addScreenshot(screenshot: ScreenshotModel): void {
    this.workInterval.screenshot = screenshot;
    this.screenshot = screenshot;
  }

  public setLastScreenshot(obj: object): void {
    if (this.isObjectEmpty(obj)) {
      return;
    }
    const keys = Object.keys(obj);
    keys.sort((a, b) => (+b) - (+a));

    if (obj[keys[0]].hasOwnProperty('time')) {
      for (const key of keys) {
        if (obj[key].hasOwnProperty('screenshot')) {
          this.screenshot = obj[key].screenshot;
          return;
        }
      }
      return;
    } else {
      for (const key of keys) {
        (!this.screenshot || this.isObjectEmpty(this.screenshot)) && this.setLastScreenshot(obj[key]);
      }
    }
  }

  // if screenshot is deleted
  public nullifyIntervalTime(): void {
    this.workInterval.time = 0;
  }

  public getLastIntervalTime(date = new Date()): number {
    const intervalMinutes = this.interval / 60;
    const presentMinutes = date.getMinutes();

    let minutes = presentMinutes;
    if ((60 - presentMinutes) % intervalMinutes !== 0) {
      minutes -= (intervalMinutes - ((60 - presentMinutes) % intervalMinutes));
    }

    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), minutes).getTime();
  }


  // get/set start time values

  public setStartTimeValues(): void {
    const date: Date = new Date();
    this.startWeek = this.getStartWeek(date);
    this.startDay = this.getStartDay(date);
    this.startHour = this.getStartHour(date);
  }

  public getStartWeek(date: Date): number {
    const day = date.getDay();
    const startWeekDate = (date.getDate() - day) + (day === 0 ? -6 : 1);
    return new Date(date.getFullYear(), date.getMonth(), startWeekDate).getTime();
  }

  public getStartDay(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }

  public getStartHour(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).getTime();
  }


  // update work data by date

  public updateWorkTimeByDate(date: Date): void {
    this.isObjectEmpty(this.workData[this.lastWeekKey]) && delete this.workData[this.lastWeekKey];
    this.startWeek = this.getStartWeek(date);
    this.lastWeekKey !== this.startWeek && this.addNewWeek();

    this.isObjectEmpty(this.workData[this.lastWeekKey][this.lastDayKey]) &&
    delete this.workData[this.lastWeekKey][this.lastDayKey];
    this.startDay = this.getStartDay(date);
    this.lastDayKey !== this.startDay && this.addNewDay();

    this.startHour = this.getStartHour(date);
    this.lastHourKey !== this.startHour && this.addNewHour();
  }

  public addNewWeek(): void {
    this.workData[this.startWeek] = {
      [this.startDay]: {
        [this.startHour]: {}
      }
    };
    this.lastWeekKey = this.startWeek;
    this.lastDayKey = this.startDay;
    this.lastHourKey = this.startHour;
  }

  public addNewDay(): void {
    this.workData[this.lastWeekKey][this.startDay] = {
      [this.startHour]: {}
    };
    this.lastDayKey = this.startDay;
    this.lastHourKey = this.startHour;
  }

  public addNewHour(): void {
    this.workData[this.lastWeekKey][this.lastDayKey][this.startHour] = {};
    this.lastHourKey = this.startHour;
  }


  // get/set sums of time

  public getSummaryTimeFromObject(obj: any, sum = 0): number {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key].hasOwnProperty('time')) {
        sum += obj[key].time;
      } else {
        sum += this.getSummaryTimeFromObject(obj[key]);
      }
    }
    return sum;
  }

  public setSumsOfTime(): void {
    this.setTodayWorkTime();
    this.setWeekWorkTime();
  }

  private setTodayWorkTime(): void {
    // debugger;
    this.today = this.getSummaryTimeFromObject(this.workData[this.lastWeekKey][this.lastDayKey]);
    // debugger;
  }

  private setWeekWorkTime(): void {
    // debugger;
    this.week = this.getSummaryTimeFromObject(this.workData[this.lastWeekKey]);
    // debugger;
  }


  public createWorkTimeObject(): void {
    this.workData = {
      [this.startWeek]: {
        [this.startDay]: {
          [this.startHour]: {}
        }
      }
    };
  }


  // work with work interval object

  public setWorkInterval(): void {
    const lastInterval = this.getLastIntervalTime();
    this.workInterval = lastInterval === this.lastIntervalKey ?
      this.workData[this.lastWeekKey][this.lastDayKey][this.lastHourKey][this.lastIntervalKey] :
      {
        time: 0,
        actions: 0
      };

    this.lastIntervalKey = lastInterval;
    console.log('setWorkInterval: ', this.workData, this.workInterval);
  }

  public addWorkInterval(): void {
    const lastInterval = this.getLastIntervalTime();
    this.workData[this.lastWeekKey][this.lastDayKey][this.lastHourKey][this.lastIntervalKey] = this.workInterval;
    this.lastIntervalKey = lastInterval;
    console.log('addWorkInterval: ', this.workData);
  }

  public isWorkIntervalUseless(): boolean {
    return this.workInterval.actions === 0 && this.workInterval.time / 1000 / 60 >= 1;
  }


  // helpers

  public getLastKey(obj: object): number {
    if (this.isObjectEmpty(obj)) {
      return;
    }
    const keys = Object.keys(obj);
    keys.sort((a, b) => (+a) - (+b));
    return +keys[keys.length - 1];
  }

  public isObjectEmpty(obj: object): any {
    return Object.keys(obj).length === 0;
  }
}
