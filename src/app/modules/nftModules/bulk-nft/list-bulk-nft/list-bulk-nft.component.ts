import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { ApiService } from '../../../../services/apiServices/api.service';
import { CommonService } from '../../../../services/common/common.service';
import { SpinnerService } from '../../../../services/spinner/spinner.service';
import { AvaliableSSIDComponent } from '../../../../shared/components/avaliable-ssid/avaliable-ssid.component';


@Component({
  selector: 'app-list-bulk-nft',
  templateUrl: './list-bulk-nft.component.html',
  styleUrls: ['./list-bulk-nft.component.scss']
})
export class ListBulkNFTComponent implements OnInit {

  public avalaibleBlockChainData: any = [];
  public currentblockchain: any;
  public myProfileID = localStorage.getItem('profileID');
  public myProfile = localStorage.getItem('myProfile');
  public eventHistory = [];
  public nftList: any = [];
  public skipNFT: any = 0;
  public bulkNftData: any = [];
  public loadingBulkNFTS = false;
  public selectedSSID = null;
  public selectedSSIDName: string;
  public userPrivateKey;
  public allSsidList = [];
  public showSelectSSIDError;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    private loader: SpinnerService,
    public common: CommonService,
    public dialog: MatDialog
  ) { }

  async ngOnInit(): Promise<void> {
    // if (!this.selectedSSID) {

    //   await this.getAllSsids();
    //   // this.getEstimateFee()
    //   $('#myModalSsidList').modal('show');
    // } else {
    //   this.getBlockChainData();

    // }
    this.getNFTSbyProfileId();
  }

  async getNFTSbyProfileId() {
    // this.spinner.show();
    this.loadingBulkNFTS = true;
    this.common.loaderText = 'Fetching all NFTs..';
    const result: any = await this.api.apiProcess({
      type: 'getALLBulkNFTByProfileID',
      // fetchType: 'mine', skip: 0, limit: 20,
      profileID: this.myProfileID
    }).toPromise();
    console.log(result);
    this.loadingBulkNFTS = false;
    this.bulkNftData = result.result.status;
    console.log('bulk nft data ', this.bulkNftData);
  }

  goToViewBulkNFTPage(batchID) {
    this.router.navigate([`/bulk-nft/view-bulk/${batchID}`], { relativeTo: this.route });
  }

  showCreate() {
    this.router.navigate(['/bulk-nft'], { relativeTo: this.route });
  }

  openSSIDDialog() {
    const dialogRef = this.dialog.open(AvaliableSSIDComponent, {
      disableClose: true,
      height: 'auto',
      width: '700px',
      panelClass: 'ListingPreview',
    });

    dialogRef.afterClosed().subscribe(item => {
      console.log('response back from dialog', item);
      if (!item) { return; };
      if (item.status === 'APPROVED') {
        this.selectedSSID = item.ssid;
        this.selectedSSIDName = item.name;
        this.common.selectedSSID = item.ssid;
        this.common.ssidObject = item;
        this.showSelectSSIDError = false;
        this.getUserKeys();
        this.getBlockChainData();
        return;
      } {
        Swal.fire('Client ID Status -  Pending', 'Kindly wait for approval or select approved Client ID');
      }
    });
  }

  selectSSID(item?) {
    if (item.status === 'APPROVED') {
      console.log(item);
      this.selectedSSID = item.ssid;
      this.selectedSSIDName = item.name;
      this.common.selectedSSID = item.ssid;
      this.common.ssidObject = item;
      // $('#myModalSsidList').modal('hide');
      this.showSelectSSIDError = false;
      this.getUserKeys();
      this.getBlockChainData();
      // this.getEstimateFee()
      return;
    } {
      Swal.fire('Client ID Status -  Pending ', 'Kindly wait for approval or select approved Client ID');
    }

  }

  async getAllSsids(): Promise<void> {
    this.loader.show();
    this.common.loaderText = 'Fetching Client ID details..';
    const res: any = await this.api.apiProcess({ type: 'getAllSSID' }).toPromise();
    console.log('my ssid Data', res);
    this.loader.hide();
    this.allSsidList = res.result.status.data;
  }

  getUserKeys() {
    this.userPrivateKey = localStorage.getItem(`ssid-${this.selectedSSID}-privateKey`);
    // this.userPublicKey = localStorage.getItem(`ssid-${this.selectedSSID}-publicKey`);
  }

  async getBlockChainData() {
    this.avalaibleBlockChainData = [];
    this.common.blockChainData.map(async data => {
      console.log(data);
      this.currentblockchain = data.value;

      const keyName = data.value + 'PrivateKey' + this.selectedSSID;
      data.selected = false;
      const obj = await localStorage.getItem(keyName);
      if (obj) {
        data.keys = JSON.parse(obj);
        console.log(data.image);
        this.avalaibleBlockChainData.push(data);
      }
      console.log(this.avalaibleBlockChainData.length);
      // if (this.avalaibleBlockChainData.length >= 1) { this.showWalletBtn = false; } else { this.showWalletBtn = true; }

    });
  }

}

