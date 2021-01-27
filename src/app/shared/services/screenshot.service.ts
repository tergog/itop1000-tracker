import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

@Injectable()
export class ScreenshotService {

  constructor(private http: HttpClient) { }

  public takeScreenshot(projectId: number, workTime: object): Observable<any> {
    return this.http.post<any>(`${environment.apiURL}/accounts/screenshot`, {projectId, workTime}).pipe(take(1));
  }

  public deleteScreenshot(link: string): Observable<any> {
    return this.http.post<any>(`${environment.apiURL}/accounts/delete-screenshot`, { link }).pipe(take(1));
  }
}
