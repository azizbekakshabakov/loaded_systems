import { Component, SimpleChange } from '@angular/core';
import { Task } from './task.interface';
import { TaskService } from '../task.service';
import { MessageService } from '../message.service';
import { Subscription } from 'rxjs';
import { AutoService } from '../services/auto-service/auto.service';
import { Router } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent {
  tasks: any[] = [];
  balance: any = 0;
  someData: any[] = [];

  constructor(private taskService: TaskService, private autoService: AutoService, private router: Router, private readonly apollo: Apollo) {}

  ngOnInit(): void {
    this.getTasks();
  }

  getTasks(): void {
    this.apollo
    .watchQuery({
      query: gql`
        {
          cars {
            _id
            name
            description
            image
            tariff
            enabled
          },
          user {
            balance
          }
        }
      `,
    })
    .valueChanges.subscribe((result: any) => {
      this.tasks = result.data['cars'];

      if (this.isUser()) {
        this.balance = result.data['user']['balance'];
      }
      // this.rates = result.data?.rates;
    });

    // REST VARIANT
    // this.taskService.getTasks().subscribe(tasks => {
    //   this.tasks = tasks;
    //   console.log('azik', tasks);
    // });

    // REST VARIANT
    // if (this.isUser()) {
    //   this.autoService.getBalance().subscribe(userBalance => {
    //     this.balance = userBalance['data'];
    //     // console.log(this.balance);
    //   });
    // }
  }

  delete(task: Task): void {
    // REST VARIANT
    // this.taskService.deleteTask(task._id).subscribe(task => {
    //   this.getTasks();
    // });

    this.apollo.mutate(
      { mutation: gql`
          mutation DeleteCar($id: ID!) {
            deleteCar(_id: $id)
          }
        `,
        variables: {
          id: task._id
        },
      }).subscribe((data: any) => {
      this.router.navigate(['/tasks']);
    });
  }

  rent(car: any): void {
    // REST VARIANT
    // this.autoService.rent(car._id).subscribe(task => {
    //   this.getTasks();
    //   this.router.navigate(['/rents']);
    // });

    // GRAPHQL VARIANT
    this.apollo.mutate(
      { mutation: gql`
          mutation Rent($carId: ID!) {
            rent(carId: $carId)
          }
        `,
        variables: {
          carId: car._id
        },
      }).subscribe((data: any) => {
        console.log(data);
        this.router.navigate(['/rents']);
      }
    );
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
