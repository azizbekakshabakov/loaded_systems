import { Component } from '@angular/core';
import { AutoService } from '../../services/auto-service/auto.service';
import { Router } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';

@Component({
  selector: 'app-add-auto',
  templateUrl: './add-auto.component.html',
  styleUrl: './add-auto.component.css'
})
export class AddAutoComponent {
  name?: string;
  description?: string;
  tariff?: number;
  image?: any;

  constructor(private autoService: AutoService, private router: Router, private readonly apollo: Apollo) {
  }

  add(): void {
    if (this.name && this.description && this.tariff && this.image) {
      this.apollo.mutate(
        { mutation: gql`
          mutation CreateCar($name: String!, $description: String!, $tariff: Float!, $image: Upload!) {
            createCar(name: $name, description: $description, tariff: $tariff, image: $image) {
              name
              description
              image
              tariff
            }
          }
        `,
        variables: {
          name: this.name,
          description: this.description,
          tariff: Number(this.tariff),
          image: this.image,
        },
        context: {
          useMultipart: true,
        },
      }).subscribe();

      // this.autoService.add(this.name, this.description, this.tariff, this.image)
      //   .subscribe((data: any) => {
      //     // localStorage.setItem("token", data);
      //     this.router.navigate(['/tasks']);
      //   });
    }
  }

  onFileChange(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.image = input.files[0];
    }
    console.log(this.image);
  }
}
