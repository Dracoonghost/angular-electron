import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import MetisMenu from 'metismenujs/dist/metismenujs';

import { MENU } from './menu';
import { MenuItem } from './menu.model';
import { Router, NavigationEnd } from '@angular/router';
import { AclStorageService } from '../../../services/acl-storage/acl-storage.service';
declare let $: any;
declare let jQuery: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, AfterViewInit {

  @ViewChild('sidebarToggler') sidebarToggler: ElementRef;

  sidebarnavItems = [];
  aclList;
  filteredList = [];
  @ViewChild('sidebarMenu') sidebarMenu: ElementRef;

  constructor(@Inject(DOCUMENT) private document: Document,
    public acl: AclStorageService, private renderer: Renderer2, public router: Router) {
    router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {

        /**
         * Activating the current active item dropdown
         */
        this._activateMenuDropdown();

        /**
         * closing the sidebar
         */
        if (window.matchMedia('(max-width: 991px)').matches) {
          this.document.body.classList.remove('sidebar-open');
        }

      }
    });
  }

  ngOnInit(): void {
    this.sidebarnavItems = MENU;
    if (this.acl.userACL) {
      this.aclList = this.acl.userACL;
    } else {
      console.log('else', localStorage.getItem('currentJWT'));

      this.acl.getDecodedUserToken(localStorage.getItem('currentJWT'));
      this.aclList = this.acl.userACL;
    }
    console.log(this.aclList);

    /**
     * Sidebar-folded on desktop (min-width:992px and max-width: 1199px)
     */
    const desktopMedium = window.matchMedia('(min-width:992px) and (max-width: 1199px)');
    desktopMedium.addListener(this.iconSidebar);
    this.iconSidebar(desktopMedium);

    $('.sidebar.mm-show').hover(function() {
      $('body').toggleClass('open-sidebar-folded');
    });
    this.filterMenu();


    $(document).ready(function() {
      if ($('.sub-menu').hasClass('mm-show')) {
        $('.SubMenuBtn').toggleClass('transform');
      }
    });

    $('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  }

  ngAfterViewInit() {
    // activate menu item
    new MetisMenu(this.sidebarMenu.nativeElement);

    this._activateMenuDropdown();
  }


  /**
   * Logout
   */
  onLogout(e) {
    e.preventDefault();
    localStorage.removeItem('isLoggedin');
    localStorage.removeItem('currentJWT');
    if (!localStorage.getItem('isLoggedin')) {
      this.router.navigate(['/login']);
    }
  }

  filterMenu() {
    console.log('filtermenu');

    let toPush = false;
    const test = this.sidebarnavItems;
    console.log(test);

    test.forEach(bar => {
      toPush = false;
      console.log(bar, this.aclList);
      if (!bar.aclRequired) {
        toPush = true;

      } else {
        // let stop = false;
        if (bar.acls) {
          bar.acls.map(element => {
            console.log(element);
            // if (stop) { toPush = true; return }
            if (Object.keys(this.aclList).includes(element)) {
              console.log('objecty FOund ', element);
              if (this.aclList[element] === true) {
                console.log('returning  TRUE');
                toPush = true;
                // stop = true;
                return;
              }
            }
          });
        }
      }

      if (toPush) { this.filteredList.push(bar); return true; }
    });
    console.log(this.filteredList);

    this.filterSubMenu();

  }

  filterSubMenu() {
    for (let i = 0; i < this.filteredList.length; i++) {
      if (this.filteredList[i].aclRequired === false) {
        console.log('SKIPPING ');

        continue;
      }
      const filterdSubMenuWithAccess = this.filteredList[i].submenu.filter((element) =>
        Object.keys(this.aclList).includes(element.aclName) && this.aclList[element.aclName]
      );
      this.filteredList[i].submenu = filterdSubMenuWithAccess;
    }

    console.log('Filter SubMenu - ', this.filteredList);

  }


  /**
   * Toggle sidebar on hamburger button click
   */
  toggleSidebar(e) {
    this.sidebarToggler.nativeElement.classList.toggle('active');
    this.sidebarToggler.nativeElement.classList.toggle('not-active');
    if (window.matchMedia('(min-width: 992px)').matches) {
      e.preventDefault();
      this.document.body.classList.toggle('sidebar-folded');
    } else if (window.matchMedia('(max-width: 991px)').matches) {
      e.preventDefault();
      this.document.body.classList.toggle('sidebar-open');
    }
  }


  /**
   * Toggle settings-sidebar
   */
  toggleSettingsSidebar(e) {
    e.preventDefault();
    this.document.body.classList.toggle('settings-open');
  }


  /**
   * Open sidebar when hover (in folded folded state)
   */
  operSidebarFolded() {
    if (this.document.body.classList.contains('sidebar-folded')) {
      this.document.body.classList.add('open-sidebar-folded');
    }
  }


  /**
   * Fold sidebar after mouse leave (in folded state)
   */
  closeSidebarFolded() {
    if (this.document.body.classList.contains('sidebar-folded')) {
      this.document.body.classList.remove('open-sidebar-folded');
    }
  }

  /**
   * Sidebar-folded on desktop (min-width:992px and max-width: 1199px)
   */
  iconSidebar(e) {
    // if (e.matches) {
    //   this.document.body.classList.add('sidebar-folded');
    // } else {
    //   this.document.body.classList.remove('sidebar-folded');
    // }
  }


  /**
   * Switching sidebar light/dark
   */
  onSidebarThemeChange(event) {
    this.document.body.classList.remove('sidebar-light', 'sidebar-dark');
    this.document.body.classList.add(event.target.value);
    this.document.body.classList.remove('settings-open');
  }


  /**
   * Returns true or false if given menu item has child or not
   *
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    return item.submenu !== undefined ? item.submenu.length > 0 : false;
  }


  /**
   * Reset the menus then hilight current active menu item
   */
  _activateMenuDropdown() {
    this.resetMenuItems();
    this.activateMenuItems();
  }


  /**
   * Resets the menus
   */
  resetMenuItems() {

    const links = document.getElementsByClassName('nav-link-ref');

    for (let i = 0; i < links.length; i++) {
      const menuItemEl = links[i];
      menuItemEl.classList.remove('mm-active');
      const parentEl = menuItemEl.parentElement;

      if (parentEl) {
        parentEl.classList.remove('mm-active');
        const parent2El = parentEl.parentElement;

        if (parent2El) {
          parent2El.classList.remove('mm-show');
        }

        const parent3El = parent2El.parentElement;
        if (parent3El) {
          parent3El.classList.remove('mm-active');

          if (parent3El.classList.contains('side-nav-item')) {
            const firstAnchor = parent3El.querySelector('.side-nav-link-a-ref');

            if (firstAnchor) {
              firstAnchor.classList.remove('mm-active');
            }
          }

          const parent4El = parent3El.parentElement;
          if (parent4El) {
            parent4El.classList.remove('mm-show');

            const parent5El = parent4El.parentElement;
            if (parent5El) {
              parent5El.classList.remove('mm-active');
            }
          }
        }
      }
    }
  };


  /**
   * Toggles the menu items
   */
  activateMenuItems() {

    const links = document.getElementsByClassName('nav-link-ref');

    let menuItemEl = null;

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < links.length; i++) {
      // tslint:disable-next-line: no-string-literal
      // eslint-disable-next-line @typescript-eslint/dot-notation
      if (window.location.pathname === links[i]['pathname']) {

        menuItemEl = links[i];

        break;
      }
    }

    if (menuItemEl) {
      menuItemEl.classList.add('mm-active');
      const parentEl = menuItemEl.parentElement;

      if (parentEl) {
        parentEl.classList.add('mm-active');

        const parent2El = parentEl.parentElement;
        if (parent2El) {
          parent2El.classList.add('mm-show');
        }

        const parent3El = parent2El.parentElement;
        if (parent3El) {
          parent3El.classList.add('mm-active');

          if (parent3El.classList.contains('side-nav-item')) {
            const firstAnchor = parent3El.querySelector('.side-nav-link-a-ref');

            if (firstAnchor) {
              firstAnchor.classList.add('mm-active');
            }
          }

          const parent4El = parent3El.parentElement;
          if (parent4El) {
            parent4El.classList.add('mm-show');

            const parent5El = parent4El.parentElement;
            if (parent5El) {
              parent5El.classList.add('mm-active');
            }
          }
        }
      }
    }
  };

  Sidebarfolded() {
    $('body').toggleClass('sidebar-folded');
    $('.sidebar-toggler.not-active').toggleClass('active');
    // if ($(".sidebar-toggler").hasClass("not-active")) {
    //   $(".sidebar-toggler.not-active").removeClass("not-active");
    // }
    // else {
    //   $(".sidebar-toggler").addClass("not-active");
    // }
  }

  Submenu() {
    // $(".sub-menu").slideDown(200);
    $('.sub-menu').toggleClass('mm-show');
    $('.SubMenuBtn').toggleClass('transform');
  };

}

