import { ScreenshotModel } from './screenshot.model';

export interface Project {
  _id: string;
  title: string;
  employerId: string;
  screenshotsPerHour: number;
  workTime: number;
  dayWorkTime: number;
  hoursPerWeek: number;
  screenshots: Array<ScreenshotModel>;
}
