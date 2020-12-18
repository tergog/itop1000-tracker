import { ScreenshotModel } from './screenshot.model';
import { workTimeModel } from './work-time.model';

export interface Project {
  _id: string;
  title: string;
  employerId: string;
  screenshotsPerHour: number;
  workTime: workTimeModel;
  dayWorkTime: number;
  hoursPerWeek: number;
  screenshots: Array<ScreenshotModel>;
}
