import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Phase } from '../model/phase';
import { Observable } from 'rxjs';
import { StatePhase } from '../model/state-phase';
import { HeaderType } from '../enum/header-type.enum';

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

  public createPhases(phase: Phase, token: string): Observable<Phase> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json').set(HeaderType.JWT_TOKEN, token);
    return this.http.post<Phase>(`${this.host}/phase/create`, JSON.stringify(phase), { headers: headers });
  }

  public createPhaseFormData(loggedInUsername: string, _phase: Phase): FormData {
    const formDataPhase = new FormData();
    formDataPhase.append('phase', _phase.phase);
    formDataPhase.append('startDuration', _phase.startDuration.toString());
    formDataPhase.append('endDuration', _phase.endDuration.toString());
    formDataPhase.append('description', _phase.description.toString());
    formDataPhase.append('ordering', _phase.ordering.toString());
    formDataPhase.append('idStatePhase', _phase.statePhase.idStatePhase.toString());
    return formDataPhase;
  }
  //{ query_string: searchTerm }
}
