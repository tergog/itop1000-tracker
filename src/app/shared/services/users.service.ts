import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from '../../../environments/environment';


@Injectable()
export class UsersService {

  constructor(private http: HttpClient) { }

  public login(data: object): Observable<any> {
    return this.http.post<any>(`${environment.apiURL}/accounts/auth`, data).pipe(take(1));
  }

  public getUserProjects(): Observable<any> {
    return this.http.get<any>(`${environment.apiURL}/accounts/projects`).pipe(take(1));
  }

  public updateWorkTime(projectId: number, workTime: object): Observable<any> {
    return this.http.post<any>(`${environment.apiURL}/accounts/update`, {projectId, workTime}).pipe(take(1));
  }
}
