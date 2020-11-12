import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DevelopersService {

  constructor(private http: HttpClient) { }


  public uploadScreenshot(image: string | ArrayBuffer): Observable<string> {
    return this.http.post<string>(``, {image});
  }
}
