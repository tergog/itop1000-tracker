import { Injectable } from '@angular/core';

import { WorkDataModel } from '../models/work-data.model';
import { ScreenshotModel } from '../models/screenshot.model';

@Injectable({
  providedIn: 'root'
})
export class WorkDataService {
  public workTime: WorkDataModel = {};
  public today = 0;
  public week = 0;
  public interval = 0;
  public screenshot: ScreenshotModel;

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

    (!workTimeObject || this.isObjectEmpty(workTimeObject)) ? this.createWorkTimeObject() : this.workTime = workTimeObject;

    this.lastWeekKey = this.getLastKey(this.workTime);
    this.lastDayKey = this.getLastKey(this.workTime[this.lastWeekKey]);
    this.lastHourKey = this.getLastKey(this.workTime[this.lastWeekKey][this.lastDayKey]);
    this.lastIntervalKey = this.getLastIntervalTime();

    this.setLastScreenshot(this.workTime);

    this.updateWorkTimeByDate();

    console.log(this.workTime);
    if (!this.workTime[this.lastWeekKey][this.lastDayKey][this.lastHourKey].hasOwnProperty(this.lastIntervalKey)) {
      this.createIntervalObject();
    }
    this.setSumsOfTime();
  }

  public addWorkTime(sec: number): void {
    const date: Date = new Date();

    if (date.getDay() !== new Date(this.lastDayKey).getDay()) {
      this.setStartTimeValues();
      this.updateWorkTimeByDate();
      this.setSumsOfTime();
    }

    if (date.getHours() !== new Date(this.lastHourKey).getHours()) {
      this.updateLastIntervalObject(sec);
      this.isObjectEmpty(this.workTime[this.lastWeekKey][this.lastDayKey][this.lastHourKey]) &&
      delete this.workTime[this.lastWeekKey][this.lastDayKey][this.lastHourKey];
      this.startHour = this.getStartHour(date);
      this.addNewHour();
      this.createIntervalObject();
      return;
    }

    const lastInterval = this.getLastIntervalTime();
    console.log(new Date());
    if (!this.workTime[this.lastWeekKey][this.lastDayKey][this.lastHourKey].hasOwnProperty(lastInterval)) {
      this.updateLastIntervalObject(sec);
      this.createIntervalObject();
      return;
    }

    this.workTime[this.lastWeekKey][this.lastDayKey][this.lastHourKey][this.lastIntervalKey].time += sec;
  }

  public addAction(action: number): void {
    this.workTime[this.lastWeekKey][this.lastDayKey][this.lastHourKey][this.lastIntervalKey].actions += action;
  }

  public addScreenshot(screenshot: ScreenshotModel): void {
    const screenshotDate = new Date(screenshot.dateCreated);
    const week = this.getStartWeek(screenshotDate);
    const day = this.getStartDay(screenshotDate);
    const hour = this.getStartHour(screenshotDate);
    const interval = this.getLastIntervalTime(screenshotDate);

    this.workTime[week][day][hour][interval].screenshot = screenshot;
    this.screenshot = screenshot;
    console.log('addScreenshot: ', this.workTime);
  }

  public deleteScreenshot(): void {
    this.workTime[this.lastWeekKey][this.lastDayKey][this.lastHourKey][this.lastIntervalKey].time = 0;
  }

  public getLastIntervalTime(date = new Date()): number {
    // const date = new Date();
    const intervalMinutes = this.interval / 60;
    const presentMinutes = date.getMinutes();

    let minutes = presentMinutes;
    if ((60 - presentMinutes) % intervalMinutes !== 0) {
      minutes -= (intervalMinutes - ((60 - presentMinutes) % intervalMinutes));
    }

    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), minutes).getTime();
  }

  public createIntervalObject(): void {
    const createTime = this.getLastIntervalTime();
    this.workTime[this.lastWeekKey][this.lastDayKey][this.lastHourKey][createTime] = {time: 0, actions: 0};
    this.lastIntervalKey = createTime;
  }

  private updateLastIntervalObject(sec: number): void {
    const lastIntervalKey = this.getLastKey(this.workTime[this.lastWeekKey][this.lastDayKey][this.lastHourKey]);
    const actions = this.workTime[this.lastWeekKey][this.lastDayKey][this.lastHourKey][lastIntervalKey].actions;
    const time = this.workTime[this.lastWeekKey][this.lastDayKey][this.lastHourKey][lastIntervalKey].time;

    actions === 0 && time / 1000 / 60 > 1 ?
      delete this.workTime[this.lastWeekKey][this.lastDayKey][this.lastHourKey][lastIntervalKey] :
      this.workTime[this.lastWeekKey][this.lastDayKey][this.lastHourKey][lastIntervalKey].time += sec;
  }

  public setInterval(sec: number): void {
    this.interval = sec;
  }

  private setWeekWorkTime(): void {
    this.week = this.getSummaryTimeFromObject(this.workTime[this.lastWeekKey]);
  }

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

  private updateWorkTimeByDate(): void {
    this.isObjectEmpty(this.workTime[this.lastWeekKey]) && delete this.workTime[this.lastWeekKey];
    this.lastWeekKey !== this.startWeek && this.addNewWeek();

    this.isObjectEmpty(this.workTime[this.lastWeekKey][this.lastDayKey]) &&
    delete this.workTime[this.lastWeekKey][this.lastDayKey];
    this.lastDayKey !== this.startDay && this.addNewDay();


    this.isObjectEmpty(this.workTime[this.lastWeekKey][this.lastDayKey][this.lastHourKey]) &&
    delete this.workTime[this.lastWeekKey][this.lastDayKey][this.lastHourKey];
    this.lastHourKey !== this.startHour && this.addNewHour();
  }

  public addNewWeek(): void {
    this.workTime[this.startWeek] = {
      [this.startDay]: {
        [this.startHour]: {}
      }
    };
    this.lastWeekKey = this.startWeek;
    this.lastDayKey = this.startDay;
    this.lastHourKey = this.startHour;
    this.createIntervalObject();
  }

  public addNewDay(): void {
    this.workTime[this.lastWeekKey][this.startDay] = {
      [this.startHour]: {}
    };
    this.lastDayKey = this.startDay;
    this.lastHourKey = this.startHour;
    this.createIntervalObject();
  }

  public addNewHour(): void {
    this.workTime[this.lastWeekKey][this.lastDayKey][this.startHour] = {};
    this.lastHourKey = this.startHour;
    this.createIntervalObject();
  }

  private setSumsOfTime(): void {
    this.setTodayWorkTime();
    this.setWeekWorkTime();
  }

  private setTodayWorkTime(): void {
    this.today = this.getSummaryTimeFromObject(this.workTime[this.lastWeekKey][this.lastDayKey]);
  }

  public createWorkTimeObject(): void {
    const intervalKey = this.getLastIntervalTime();
    this.workTime = {
      [this.startWeek]: {
        [this.startDay]: {
          [this.startHour]: {
            [intervalKey]: {
              time: 0,
              actions: 0
            }
          }
        }
      }
    };
    this.lastIntervalKey = intervalKey;
  }

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

  public setLastScreenshot(obj: object): void {
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
