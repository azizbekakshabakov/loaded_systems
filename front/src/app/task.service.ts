import { Injectable } from '@angular/core';
import { Task } from './tasks/task.interface';
import { TASKS } from './mock-tasks';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { MessageService } from './message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksUrl = "http://localhost:3000/car";
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  };

  constructor(
    private messageService: MessageService,
    private http: HttpClient) { }

  getTasks(): Observable<any[]> {
    const tasks = this.http.get<any[]>(this.tasksUrl)
      .pipe(
        map((response: any) => response['data']),
        tap(_ => this.log("fetched tasks")),
        // catchError(this.handleError<Task[]>("getTasks", []))
      );
    return tasks;
  }

  getTask(id: string): Observable<Task> {
    const url = `${this.tasksUrl}/${id}`;
    const task = this.http.get<Task>(url)
      .pipe(
        map((response: any) => response['data']),
        tap(_ => this.log(`fetched task id=${id}`)),
        catchError(this.handleError<Task>(`getTask id=${id}`))
      );
    return task;
  }

  updateTask(task: Task): Observable<any> {
    const result = this.http.put(`${this.tasksUrl}/${task._id}`, task, this.httpOptions)
      .pipe(
        tap(_ => this.log(`updated task id=${task._id}`)),
        catchError(this.handleError<any>('updateTask'))
      );
    return result;
  }

  addTask(task: Task): Observable<Task> {
    const result = this.http.post<Task>(this.tasksUrl, task, this.httpOptions)
      .pipe(
        tap((newTask: Task) => this.log(`added task w/ id=${newTask._id}`)),
        catchError(this.handleError<Task>('addTask'))
      );
    return result;
  }

  deleteTask(id: string): Observable<Task> {
    const url = `${this.tasksUrl}/${id}`;
    return this.http.delete<Task>(url, this.httpOptions)
      .pipe(
        tap(_ => this.log(`deleted task id=${id}`)),
        catchError(this.handleError<Task>('deleteTask'))
      );
  }

  private log(message: string) {
    this.messageService.add(`TaskService: ${message}`);
  }

  private handleError<T>(operation = "operation", result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
