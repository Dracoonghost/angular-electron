import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../services/apiServices/api.service';
import { CommonService } from '../../../services/common/common.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {

  public NFT: any;
  public myProfileID = localStorage.getItem('profileID');
  public myProfile = JSON.parse(localStorage.getItem('myProfile'));

  constructor(
    private common: CommonService,
    private router: Router,
    private api: ApiService,
    public dialogRefActivate: MatDialogRef<InvoiceComponent>
  ) { }

  ngOnInit(): void {
    if (!this.common.NFT) {
      this.router.navigate(['/nft/nfts']);
    } else {
      this.NFT = this.common.NFT;
    }
    this.getAllSsids();
  }

  async getAllSsids(): Promise<void> {
    this.common.loaderEvent.next(true);
    const res: any = await this.api.apiProcess({ type: 'getAllSSID' }).toPromise();
    console.log('my ssid Data', res);
    const array = res.result.status.data;
    const response = array.filter(data => { data.ssid == this.NFT.ssid; });
    console.log(response);

  }

  backToList() {
    this.dialogRefActivate.close();
  }

}
