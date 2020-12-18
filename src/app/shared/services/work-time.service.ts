import { Injectable } from '@angular/core';

import { workTimeModel } from '../models/work-time.model';

@Injectable({
  providedIn: 'root'
})
export class WorkTimeService {

  public workTime: workTimeModel = {};
  public today = 0;
  public week = 0;

  private startWeek;
  private startDay;
  private lastWeekKey: number;
  private lastDayKey: number;

  constructor() {
  }


  public setWorkTime(workTimeObject: workTimeModel): void {

    this.workTime = workTimeObject;

    this.setStartWeek();
    this.setStartDay();

    if (this.isObjectEmpty(this.workTime)) {
      this.workTime = {
        [String(this.startWeek)]: {
          [String(this.startDay)]: 0
        }
      };
    }

    this.lastWeekKey = this.getLastKey(this.workTime);
    this.lastDayKey = this.getLastKey(this.workTime[this.lastWeekKey]);

    this.updateWeekDay();

    this.setTodayWorkTime();
    this.setWeekWorkTime();
  }

  public addWorkTime(sec: number): void {
    this.workTime[this.lastWeekKey][this.lastDayKey] += sec;
  }


  //init functions

  private updateWeekDay():void {
    if (Number(this.lastWeekKey) !== this.startWeek) {
      this.workTime[this.startWeek] = {[this.startDay]: 0};
    }

    if (Number(this.lastDayKey) !== this.startDay) {
      this.workTime[this.lastWeekKey][this.startDay] = 0;
    }
  }

  private setTodayWorkTime(): void {
    this.today = this.workTime[this.lastWeekKey][this.lastDayKey];
  }

  private setWeekWorkTime(): void {
    let weekTime = 0;

    for (let day in this.workTime[this.lastWeekKey]) {
      weekTime += this.workTime[this.lastWeekKey][day];
    }

    this.week = weekTime;
  }

  private setStartWeek(): void {
    const startWeekDate = (new Date().getDate() - new Date().getDay()) + 1;
    this.startWeek = new Date(new Date().getFullYear(), new Date().getMonth(), startWeekDate).getTime();
  }

  private setStartDay(): void {
    this.startDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime();
  }


  // helpers


  private getLastKey(obj: object): any {
    const keys = Object.keys(obj);
    return keys[keys.length - 1];
  }

  private isObjectEmpty(obj: object): any {
    return Object.keys(obj).length === 0;
  }
}
