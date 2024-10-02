import { Component } from '@angular/core';
import { AutoService } from '../../services/auto-service/auto.service';
import { Router } from '@angular/router';

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

  constructor(private autoService: AutoService, private router: Router) {
  }

  add(): void {
    if (this.name && this.description && this.tariff && this.image) {
      this.autoService.add(this.name, this.description, this.tariff, this.image)
        .subscribe((data: any) => {
          // localStorage.setItem("token", data);
          this.router.navigate(['/tasks']);
        });
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
