import { Component } from '@angular/core';
import { AutoService } from '../../services/auto-service/auto.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-set-balance',
  templateUrl: './set-balance.component.html',
  styleUrl: './set-balance.component.css'
})
export class SetBalanceComponent {
  amount?: number | undefined;

  constructor(private autoService: AutoService, private router: Router, private location: Location) {
  }

  goBack(): void {
    this.location.back();
  }

  setBalance(amount: number | undefined): void {
    this.autoService.setBalance(amount).subscribe(userBalance => {
      this.goBack();
    });
  }
}
