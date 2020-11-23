import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ScreenshotService {

  constructor(private http: HttpClient) { }

  public takeScreenshot(projectId: number, workTime: number, interval: number): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/users/screenshot`, {projectId, interval, workTime});
  }
}
