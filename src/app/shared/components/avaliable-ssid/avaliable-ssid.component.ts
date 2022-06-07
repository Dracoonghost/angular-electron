import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../services/apiServices/api.service';
import { CommonService } from '../../../services/common/common.service';
import { SpinnerService } from '../../../services/spinner/spinner.service';


declare let $: any;

@Component({
  selector: 'app-avaliable-ssid',
  templateUrl: './avaliable-ssid.component.html',
  styleUrls: ['./avaliable-ssid.component.scss']
})
export class AvaliableSSIDComponent implements OnInit {

  public allSsidList: any = [];
  public loadingSSID = true;
  private myProfileID = localStorage.getItem('profileID');

  constructor(
    private api: ApiService,
    private common: CommonService,
    private loader: SpinnerService,
    public dialogRefActivate: MatDialogRef<AvaliableSSIDComponent>

  ) { }

  ngOnInit(): void {
    this.getAllSsids();
  }

  async getAllSsids(): Promise<void> {
    this.loader.show();
    this.common.loaderText = 'Fetching Client ID details..';
    const res: any = await this.api.apiProcess({ type: 'getAllSSID' }).toPromise();
    console.log('my ssid Data', res);
    this.loadingSSID = false;
    if (res) {
      this.allSsidList = res.result.status.data;
      this.common.allSsidList = res.result.status.data;
    }
    this.loader.hide();
  }

  selectSSID(data) {
    this.common.ssidObject = data;
    this.common.selectedSSID = data.ssid;
    this.common.updateBlockChainList.next(true);
    this.dialogRefActivate.close(data);
  }

  closeModal(){
    this.dialogRefActivate.close();
  }

}
