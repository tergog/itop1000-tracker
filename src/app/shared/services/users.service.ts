import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable()
export class UsersService {

  constructor(private http: HttpClient) { }

  public login(data: object): Observable<any> {
    return this.http.post<any>(`${environment.apiURL}/accounts/auth`, data);
  }

  public updateWorkTime(projectId: number, workTime: number): Observable<any> {
    return this.http.post<any>(`${environment.apiURL}/accounts/update`, {projectId, workTime});
  }
}
