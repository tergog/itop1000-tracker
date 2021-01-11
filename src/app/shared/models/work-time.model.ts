import { ScreenshotModel } from './screenshot.model';

export interface WorkTimeModel {
 [key: string]: WeekWorkTimeModel;
}

export interface WeekWorkTimeModel {
  [key: string]: DayWorkTimeModel;
}

export interface DayWorkTimeModel {
  [key: string]: HourWorkTimeModel;
}

export interface HourWorkTimeModel {
  [key: string]: IntervalWorkTimeModel;
}

export interface IntervalWorkTimeModel {
  time: number;
  actions: number;
  screenshot?: ScreenshotModel;
}


