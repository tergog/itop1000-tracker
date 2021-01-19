import { ScreenshotModel } from './screenshot.model';
import { WorkDataModel } from './work-data.model';

export interface Project {
  _id: string;
  title: string;
  employerId: string;
  screenshotsPerHour: number;
  workTime: WorkDataModel;
  dayWorkTime: number;
  hoursPerWeek: number;
  screenshots: Array<ScreenshotModel>;
}
