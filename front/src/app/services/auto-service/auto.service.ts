import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutoService {
  private autoUrl = "http://localhost:3000/car";

  constructor(private http: HttpClient) { }

  add(name: string, description: string, tariff: number, image: any): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('tariff', tariff.toString());

    const result = this.http.post<any>(`${this.autoUrl}/`, formData, {
        headers: new HttpHeaders({
          'enctype': 'multipart/form-data'
        })
      });
    return result;
  }

  rent(taskId: any) {
    return this.http.post<any>(`http://localhost:3000/rent`, {carId: taskId});
  }

  rents() {
    return this.http.get<any>(`http://localhost:3000/rent`);
  }

  deleteRent(rentId: any) {
    return this.http.delete<any>(`http://localhost:3000/rent/${rentId}`);
  }

  getBalance() {
    return this.http.get<any>(`http://localhost:3000/rent/balance`);
  }

  setBalance(amount: number | undefined) {
    const result = this.http.post<any>(`http://localhost:3000/rent/balance`, {amount});
    return result;
  }
}