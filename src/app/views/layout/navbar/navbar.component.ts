import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { LogoutComponent } from '../../../shared/components/logout/logout.component';
import { CommonService } from '../../../services/common/common.service';
declare let $: any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor(
    @Inject(DOCUMENT) public document: Document,
    public renderer: Renderer2,
    private common: CommonService,
    public router: Router,
    private location: Location,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  back(): void {
    this.location.back();
  }

  /**
   * Sidebar toggle on hamburger button click
   */
  toggleSidebar(e) {
    e.preventDefault();
    this.document.body.classList.toggle('sidebar-open');
  }

  /**
   * Logout
   */
  onLogout(e) {
    const dialogRef = this.dialog.open(LogoutComponent, {
      disableClose: true,
      height: 'auto',
      width: '750px',
      panelClass: 'LogoutModal',
    });

    dialogRef.afterClosed().subscribe(item => {
      console.log('response back from dialog', item);
      if (item === 1) {
        e.preventDefault();
        localStorage.clear();
        this.common.ssidObject = {};
        this.common.selectedSSID = null;
        if (!localStorage.getItem('isLoggedin')) {
          this.router.navigate(['/login']);
        }
      }
    });


  }
  // ProfileDropdown() {
  //   //   $('li.nav-item.nav-profile .dropdown-menu').toggleClass('show');
  // }

  Darkmode() {
    $('body').toggleClass('sidebar-light');
    $('body').toggleClass('sidebar-dark');

  }
}
