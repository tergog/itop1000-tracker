import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class UsersService {

  constructor(private http: HttpClient) { }

  public login(data: object): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/users/auth`, data);
  }

  public updateWorkTime(projectId: number, workTime: number, interval: number): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/users/update`, {projectId, workTime, interval});
  }
}
