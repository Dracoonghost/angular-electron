import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastrServiceService {

  constructor(private toast: ToastrService) { }

  public show(type, heading, text) {
    this.toast[type](heading, text);
  }
}
