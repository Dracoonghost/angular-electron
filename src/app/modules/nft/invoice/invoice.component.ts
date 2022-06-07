import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/apiServices/api.service';
import { CommonService } from '../../../services/common/common.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {

  NFT: any;
  myProfileID = localStorage.getItem('profileID');
  myProfile = JSON.parse(localStorage.getItem('myProfile'));

  constructor(
    private common: CommonService,
    private router: Router,
    private api: ApiService
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
    const data = array.filter(data =>  {data.ssid == this.NFT.ssid;});
    console.log(data);

  }

  backToList(){
    this.router.navigate(['/nft/preview']);
  }

}
