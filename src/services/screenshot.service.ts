import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ScreenshotService {

  constructor(private http: HttpClient) { }

  public takeScreenshot() {
    return this.http.get(`http://localhost:3000/screenshots`).subscribe(() => console.log('success'));
  }
}
