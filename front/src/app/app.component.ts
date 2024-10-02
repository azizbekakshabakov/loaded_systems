import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Список задач';

  constructor(private router: Router) {
  }

  isToken(): boolean {
    if (localStorage.getItem("token")) return true;
    return false;
  }

  isMod(): boolean {
    if (localStorage.getItem('role') == 'mod') {
      return true;
    }
    return false;
  }

  isUser(): boolean {
    if (localStorage.getItem('role') == 'user') {
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    this.router.navigate(['/login']);
  }
}
