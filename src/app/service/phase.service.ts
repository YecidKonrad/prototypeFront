import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Phase } from '../model/phase';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhaseService {
  private host = environment.apiUrl;

  constructor(private http: HttpClient) { }
  public getPhases(): Observable<Phase[]> {
    return this.http.get<Phase[]>(`${this.host}/phase/phases`);
  }
}
