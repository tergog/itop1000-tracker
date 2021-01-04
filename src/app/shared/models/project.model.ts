import { ScreenshotModel } from './screenshot.model';
import { WorkTimeModel } from './work-time.model';

export interface Project {
  _id: string;
  title: string;
  employerId: string;
  screenshotsPerHour: number;
  workTime: WorkTimeModel;
  dayWorkTime: number;
  hoursPerWeek: number;
  screenshots: Array<ScreenshotModel>;
}
