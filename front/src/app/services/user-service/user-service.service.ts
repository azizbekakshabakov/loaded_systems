import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, tap } from 'rxjs';
import { User } from '../../models/task.interface';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  private tasksUrl = "http://localhost:3000/auth";

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<User> {
    const result = this.http.post<User>(`${this.tasksUrl}/login`, {email, password})
      .pipe(
        map((response: any) => response/*['token']*/),
      //   tap((user: User) => this.log(`added task w/ token=${user.token}`)),
      //   catchError(this.handleError<User>('login'))
      );
    return result;
  }

  register(email: string, password: string, role: string): Observable<User> {
    const result = this.http.post<User>(`${this.tasksUrl}/register`, {email, password, role})
      .pipe(
        // map((response: any) => response['token']),
      //   tap((user: User) => this.log(`added task w/ token=${user.token}`)),
      //   catchError(this.handleError<User>('login'))
      );
    return result;
  }
}
