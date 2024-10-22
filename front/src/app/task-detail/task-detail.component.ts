import { Component, Input } from '@angular/core';
import { Task } from '../tasks/task.interface';
import {ActivatedRoute, Router} from '@angular/router';
import { Location } from '@angular/common';
import { TaskService } from '../task.service';
import {Apollo, gql} from "apollo-angular";

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.css'
})
export class TaskDetailComponent {
  task: any | undefined;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private location: Location,
    private readonly apollo: Apollo,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getTask();
  }

  getTask(): void {
    const id = this.route.snapshot.paramMap.get("id");
    this.taskService.getTask(id!).subscribe(task => this.task = task);
    console.log(this.task);
  }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    if (this.task && this.task.description && this.task.tariff) {
      console.log(this.task);
      // REST VARIANT
      // this.taskService.updateTask(this.task)
      //   .subscribe(() => this.goBack());

      // GRAPHQL VARIANT
      this.apollo.mutate(
        { mutation: gql`
            mutation UpdateCar($id: ID!, $name: String!, $description: String!, $tariff: Float!) {
              updateCar(_id: $id, name: $name, description: $description, tariff: $tariff) {
                _id
                name
                description
                image
                tariff
              }
            }
          `,
          variables: {
            id: this.task._id,
            name: this.task.name,
            description: this.task.description,
            tariff: Number(this.task.tariff),
          },
        }).subscribe((data: any) => {
          this.router.navigate(['/tasks']);
        }
      );
    }
  }
}
