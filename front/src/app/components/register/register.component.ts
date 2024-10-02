import { Component } from '@angular/core';
import { UserServiceService } from '../../services/user-service/user-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  email?: string;
  password?: string;
  role?: "mod" | "user";

  constructor(private userService: UserServiceService, private router: Router) {
  }

  register(): void {
    if (this.email && this.password && this.role) {
      this.userService.register(this.email, this.password, this.role)
        .subscribe((data: any) => {
          // localStorage.setItem("token", data);
          this.router.navigate(['/login']);
        });
    }
  }
}