import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  @ViewChild('myCheckboxOne') myCheckbox;

  termOne = false;
  termTwo = false;
  constructor(
    public dialogRefActivate: MatDialogRef<LogoutComponent>
  ) { }

  ngOnInit(): void {
  }

  closeDialog(input) {
    console.log(input);
    if(this.termOne && this.termTwo){
      this.dialogRefActivate.close(input);
    }
  }

  cancleDialog(input){
    this.dialogRefActivate.close(input);
  }

  termOneCheck() {

  }
  termsTwoCheck() {

  }

}
