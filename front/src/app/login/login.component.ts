import { Component } from '@angular/core';
import { UserServiceService } from '../services/user-service/user-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email?: string;
  password?: string;

  constructor(private userService: UserServiceService, private router: Router) {
  }

  login(): void {
    if (this.email && this.password) {
      this.userService.login(this.email, this.password)
        .subscribe((data: any) => {
          console.log(data);
          localStorage.setItem("token", data['token']);
          localStorage.setItem("role", data['role']);
          this.router.navigate(['/tasks']);
        });
    }
  }
}
