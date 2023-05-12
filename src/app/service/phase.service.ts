import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Phase } from '../model/phase';
import { Observable } from 'rxjs';
import { StatePhase } from '../model/state-phase';
import { HeaderType } from '../enum/header-type.enum';
import { PhaseRequest } from '../model/phase-request';

@Injectable({
  providedIn: 'root'
})
export class PhaseService {


  private host = environment.apiUrl;

  constructor(private http: HttpClient) { }
  public getPhases(): Observable<Phase[]> {
    return this.http.get<Phase[]>(`${this.host}/phase/phases`);
  }

  public getPhasesStates(): Observable<StatePhase[]> {
    return this.http.get<StatePhase[]>(`${this.host}/phase/states`);
  }

  public createPhases(phase: PhaseRequest, token: string): Observable<Phase> {
    console.log('En el service ' + JSON.stringify(phase));
    let headers = new HttpHeaders().set('Content-Type', 'application/json').set(HeaderType.JWT_TOKEN, token);
    return this.http.post<Phase>(`${this.host}/phase/create`, JSON.stringify(phase), { headers: headers });
  }

}
