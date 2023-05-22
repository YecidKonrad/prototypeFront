import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Task } from '../model/task';
import { StateTask } from '../model/state-task';
import { HeaderType } from '../enum/header-type.enum';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private host = environment.apiUrl;

  constructor(private http: HttpClient) { }

  updateTask(editTask: Task, token: string): Observable<Task> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json').set(HeaderType.JWT_TOKEN, token);
    return this.http.post<Task>(`${this.host}/task/update`, JSON.stringify(editTask), { headers: headers });
  }

  public getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.host}/task/tasks`);
  }
  public getTasksStates(): Observable<StateTask[]> {
    return this.http.get<StateTask[]>(`${this.host}/task/states`);
  }
  public createTask(task: Task, token: string): Observable<Task> {
    console.log('En el service Task ' + JSON.stringify(task));
    let headers = new HttpHeaders().set('Content-Type', 'application/json').set(HeaderType.JWT_TOKEN, token);
    return this.http.post<Task>(`${this.host}/task/create`, JSON.stringify(task), { headers: headers });
  }

}
