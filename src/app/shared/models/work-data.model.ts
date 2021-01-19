import { ScreenshotModel } from './screenshot.model';

export interface WorkDataModel {
 [key: string]: WorkWeekModel;
}

export interface WorkWeekModel {
  [key: string]: WorkDayModel;
}

export interface WorkDayModel {
  [key: string]: WorkHourModel;
}

export interface WorkHourModel {
  [key: string]: WorkIntervalModel;
}

export interface WorkIntervalModel {
  time: number;
  actions: number;
  screenshot?: ScreenshotModel;
}


