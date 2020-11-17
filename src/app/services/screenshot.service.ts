import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ScreenshotService {

  constructor(private http: HttpClient) { }

  public takeScreenshot(employerId, projectTitle, userId) {
    return this.http.post(`http://localhost:3000/users/screenshot`, {employerId, projectTitle, userId});
  }
}
