import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedValue: boolean = false;
  private authToken: string | null = null;

  constructor(private http: HttpClient) {
    // Check if the user is already authenticated (e.g., by checking for a token in localStorage)
    this.checkAuthentication().subscribe(authenticated => {
      this.isAuthenticatedValue = authenticated;
    });
  }

  // Authenticate user and store authentication token
  login(username: string, password: string): Observable<boolean> {
    // Send a request to the server to authenticate the user
    // Typically, this would involve sending the username and password to a login endpoint
    // The server would then validate the credentials and return an authentication token if successful
    return this.http.post<any>('/api/login', { username, password }).pipe(
      map(response => {
        if (response && response.token) {
          this.isAuthenticatedValue = true;
          this.authToken = response.token;
          // Store token in a secure manner (e.g., cookies)
          // For SSR, you might want to set a cookie with the token
          document.cookie = `token=${response.token}; Secure; HttpOnly; SameSite=Strict`;
          return true;
        } else {
          return false;
        }
      })
    );
  }

  // Log out user and clear authentication token
  logout(): void {
    this.isAuthenticatedValue = false;
    this.authToken = null;
    // Remove token from the client (e.g., cookies)
    document.cookie = 'token=; Max-Age=0; Secure; SameSite=Strict';
    // Optionally, also invalidate the token on the server side
    // This could involve sending a request to a logout endpoint
    // to invalidate the token stored on the server
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.isAuthenticatedValue;
  }

  private checkAuthentication(): Observable<boolean> {
    // Send a request to the server to check if the user is authenticated
    // This could involve accessing a protected endpoint on the server
    // The server would then validate the token and return the authentication status
    return this.http.get<boolean>('/api/check-auth').pipe(
      catchError(() => of(false))
    );
  }

  // Get authentication token
  getToken(): string | null {
    return this.authToken;
  }
}
