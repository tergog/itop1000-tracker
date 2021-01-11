import { Injectable } from '@angular/core';

import { WorkTimeModel } from '../models/work-time.model';

@Injectable({
  providedIn: 'root'
})
export class WorkTimeService {

  public workTime: WorkTimeModel = {};
  public today = 0;
  public week = 0;
  public interval = 0;

  private startWeek;
  private startDay;
  private startHour;
  private lastWeekKey: number;
  private lastDayKey: number;
  private lastHourKey: number;

  public setWorkTime(workTimeObject?: WorkTimeModel): void {
    this.workTime = workTimeObject;

    this.startWeek = this.getStartWeek();
    this.startDay = this.getStartDay();
    this.startHour = this.getStartHour();

    if (!this.workTime || this.isObjectEmpty(this.workTime)) {
      this.createWorkTimeObject();
    }

    this.lastWeekKey = this.getLastKey(this.workTime);
    this.lastDayKey = this.getLastKey(this.workTime[this.lastWeekKey]);
    this.lastHourKey = this.getLastKey(this.workTime[this.lastWeekKey][this.lastDayKey]);

    this.updateWeekDay();

    this.setTodayWorkTime();
    this.setWeekWorkTime();
  }

  // TODO update to new workTimeModel
  // public addWorkTime(sec: number): void {
  //   if (new Date().getDay() !== new Date(this.lastDayKey).getDay()) {
  //     this.startWeek = this.getStartWeek();
  //     this.startDay = this.getStartDay();
  //     this.updateWeekDay();
  //     this.setTodayWorkTime();
  //     this.setWeekWorkTime();
  //   }
  //   this.workTime[this.lastWeekKey][this.lastDayKey] += sec;
  // }


  // init functions

  public getStartWeek(): number {
    const startWeekDate = (new Date().getDate() - new Date().getDay()) + 1;
    return new Date(new Date().getFullYear(), new Date().getMonth(), startWeekDate).getTime();
  }

  public getStartDay(): number {
    return new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime();
  }

  public getStartHour(): number {
    return new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours()).getTime();
  }

  // public getLastIntervalTime(): number {
  //   const minutes = new Date().getMinutes() - (this.interval - ( 60 - new Date().getMinutes() ) % this.interval);
  //   return new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(),  minutes).getTime();
  // }

  private updateWeekDay(): void {
    if (Number(this.lastWeekKey) !== this.startWeek) {
      this.workTime[this.startWeek] = {
        [this.startDay]: {
          [this.startHour]: {}
        }
      };
      this.lastWeekKey = this.startWeek;
      this.lastDayKey = this.startDay;
      this.lastHourKey = this.startHour;
    }

    if (Number(this.lastDayKey) !== this.startDay) {
      this.workTime[this.lastWeekKey][this.startDay] = {
        [this.startHour]: {}
      };
      this.lastDayKey = this.startDay;
      this.lastHourKey = this.startHour;
    }

    if (Number(this.lastHourKey) !== this.startHour) {
      this.workTime[this.lastWeekKey][this.startDay][this.startHour] = {};
      this.lastHourKey = this.startHour;
    }
  }

  private setTodayWorkTime(): void {
    this.today = this.getSummaryTimeFromObject(this.workTime[this.lastWeekKey][this.lastDayKey]);
  }

  private setWeekWorkTime(): void {
    this.week = this.getSummaryTimeFromObject(this.workTime[this.lastWeekKey]);
  }

  public getSummaryTimeFromObject(obj: any): number {
    let sum = 0;

    for (const key in obj) {
      if (obj.hasOwnProperty(key) && 'time' in obj[key] ) {
        sum += obj.time;
      } else {
        sum += this.getSummaryTimeFromObject(obj[key]);
      }
    }

    return sum;
  }

  private createWorkTimeObject(): void {
    this.workTime = {
      [String(this.startWeek)]: {
        [String(this.startDay)]: {
          [String(this.getStartHour())]: {
            // [String(this.getLastIntervalTime())]: {
            //   time: 0,
            //   actions: 0
            // }
          }
        }
      }
    };
  }


  // helpers

  public getLastKey(obj: object): any {
    const keys = Object.keys(obj);
    keys.sort((a, b) => (+a) - (+b) );
    return `${keys[keys.length - 1]}`;
  }

  public isObjectEmpty(obj: object): any {
    return Object.keys(obj).length === 0;
  }
}
