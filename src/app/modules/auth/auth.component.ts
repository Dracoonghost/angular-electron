import { Component, OnInit } from '@angular/core';
declare let $: any;

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  Darkmode() {
    $('body').toggleClass('sidebar-light');
    $('body').toggleClass('sidebar-dark');

  }
}
