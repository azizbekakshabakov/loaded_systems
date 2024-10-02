import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service/AuthService';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Check if token is available
    const authToken = localStorage.getItem('token');

    // Add authorization header only if token is available
    if (authToken) {
      const authRequest = request.clone({
        setHeaders: {
          "x-auth-token": `${authToken}`
        }
      });
      return next.handle(authRequest);
    } else {
      // If token is not available, redirect to login page
      this.router.navigate(['/login']);
      return next.handle(request);
    }
  }

  // private isExcludedPath(url: string): boolean {
  //   // Add logic to check if the URL matches excluded paths
  //   // For example:
  //   return url.includes('/login') || url.includes('/register');
  // }
}