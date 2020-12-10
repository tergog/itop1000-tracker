import { ScreenshotModel } from './screenshot.model';

export interface Project {
  _id: string;
  title: string;
  employerId: string;
  workTime: number;
  dayWorkTime: number;
  hoursPerWeek: number;
  interval: number;
  screenshots: Array<ScreenshotModel>;
}
