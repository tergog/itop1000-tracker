import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable()
export class ScreenshotService {

  constructor(private http: HttpClient) { }

  public takeScreenshot(projectId: number, workTime: number, interval: number): Observable<any> {
    return this.http.post<any>(`${environment.apiURL}/users/screenshot`, {projectId, interval, workTime});
  }
}
