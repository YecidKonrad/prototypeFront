import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Activity } from '../model/activity';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StateActivity } from '../model/state-activity';
import { HeaderType } from '../enum/header-type.enum';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private host = environment.apiUrl;

  constructor(private http: HttpClient) { }

  public getActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.host}/activity/activities`);
  }
  public getActivitiesStates(): Observable<StateActivity[]> {
    return this.http.get<StateActivity[]>(`${this.host}/activity/states`);
  }
  public createActivities(activity: Activity, token: string): Observable<Activity> {
    console.log('En el service Activity ' + JSON.stringify(activity));
    let headers = new HttpHeaders().set('Content-Type', 'application/json').set(HeaderType.JWT_TOKEN, token);
    return this.http.post<Activity>(`${this.host}/activity/create`, JSON.stringify(activity), { headers: headers });
  }

}
