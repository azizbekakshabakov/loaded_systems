import { Component } from '@angular/core';
import { AutoService } from '../../services/auto-service/auto.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rents',
  templateUrl: './rents.component.html',
  styleUrl: './rents.component.css'
})
export class RentsComponent {
  tasks: any[] = [];
  balance: any;

  constructor(private taskService: AutoService, private autoService: AutoService, private router: Router) {}

  ngOnInit(): void {
    this.getTasks();
  }

  getTasks(): void {
    this.autoService.rents().subscribe(tasks => {
      this.tasks = tasks['cars'];
      console.log(this.tasks);
    });

    if (this.isUser())
      this.autoService.getBalance().subscribe(userBalance => {
        this.balance = userBalance['data'];
        // console.log(this.balance);
      });
  }

  unrent(task: any): void {
    this.taskService.deleteRent(task._id).subscribe(task => {
      this.getTasks();
    });
  }

  rent(car: any): void {
    this.autoService.rent(car._id).subscribe(task => {
      this.getTasks();
      this.router.navigate(['/tasks']);
    });
  }

  isMod() {
    if (localStorage.getItem("role") == "mod")
      return true;
    return false;
  }

  isUser() {
    if (localStorage.getItem("role") == "user")
      return true;
    return false;
  }
}