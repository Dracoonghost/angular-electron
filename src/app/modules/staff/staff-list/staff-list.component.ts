import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../services/apiServices/api.service';
import { CommonService } from '../../../services/common/common.service';
import { SpinnerService } from '../../../services/spinner/spinner.service';
import { StaffMemberAddComponent } from '../staff-member-add/staff-member-add.component';

@Component({
  selector: 'app-staff-list',
  templateUrl: './staff-list.component.html',
  styleUrls: ['./staff-list.component.scss']
})
export class StaffListComponent implements OnInit {
  jsonData = [];
  fetchingOrganization = false;
  constructor(
    public api: ApiService,
    public common: CommonService,
    public loader: SpinnerService,
    private dialog: MatDialog
    ) { }

  ngOnInit(): void {
    this.getAllInOrganization();
  }

  async getAllInOrganization() {
    this.loader.show();
    this.common.loaderText = 'Fetching all staff details...';
    this.fetchingOrganization = true;
    const res: any = await this.api.apiProcess({
      type: 'getAllInOrganization'
    }).toPromise();
    if (res.result.status.code) {
      console.log(res.result.status.result);
      this.fetchingOrganization = false;
      this.loader.hide();
      this.common.loaderText = 'Loading...';
      this.jsonData = res.result.status.result;
    }
    else {
      // sweetAlert('error', 'Fetching Profiles Profiles Failed , Try again.', 'error');
    }

  }

  async addStaff() {
    const dialogRef = this.dialog.open(StaffMemberAddComponent, {
      disableClose: true,
      height: 'auto',
      width: '700px',
      panelClass: 'ListingPreview',
    });

    dialogRef.afterClosed().subscribe(item => {
      console.log('response back from dialog', item);
      if(item === true){
        this.getAllInOrganization();
      }
    });
  }

}
