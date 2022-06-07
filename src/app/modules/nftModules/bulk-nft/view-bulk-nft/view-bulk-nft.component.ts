import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../../services/apiServices/api.service';
import { CommonService } from '../../../../services/common/common.service';
import { SpinnerService } from '../../../../services/spinner/spinner.service';
import { ToastrServiceService } from '../../../../services/toastr/toastr-service.service';
import { AvaliableSSIDComponent } from '../../../../shared/components/avaliable-ssid/avaliable-ssid.component';
declare let $: any;


@Component({
  selector: 'app-view-bulk-nft',
  templateUrl: './view-bulk-nft.component.html',
  styleUrls: ['./view-bulk-nft.component.scss']
})
export class ViewBulkNFTComponent implements OnInit, OnDestroy {

  public batchID;
  public bulkNFTData;
  public baselink = 'https://ipfs.moralis.io:2053/ipfs/';
  public link;
  public avalaibleBlockChainData: any = [];
  public allSsidList: any = [];
  public myProfileID = localStorage.getItem('profileID');
  public selectedWalletPrivateKey: any;
  public selectedWalletAddress: any;
  public selectedChain: any;
  public showSelectSSIDError = false;
  public showSelectMultiKeyError = false;
  public showWalletBtn = false;
  public feesEstimateInterval;
  public tickerID;
  public feeEstimateTimerCount = 0;
  public waitBeforeSendingAgain = false;
  public feeDetails;
  private bulkNFTStatusCheck: Subscription;


  constructor(
    private loader: SpinnerService,
    public common: CommonService,
    private api: ApiService,
    private router: Router,
    public route: ActivatedRoute,
    private toast: ToastrServiceService,
    public dialog: MatDialog

  ) {
    this.batchID = this.route.snapshot.paramMap.get('batchID');
  }

  async ngOnInit(): Promise<void> {
    await this.getBulkNFT();
    if (!this.common.selectedSSID && !this.bulkNFTData.ssid) {
      this.openSSIDDialog();
    }

    this.common.updateWalletKeys.subscribe(data => {
      console.log(data);
      if (data) {
        this.getBlockChainData();
      }
    });
    this.getBlockChainData();
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
        this.common.selectedSSID = item.ssid;
        this.common.ssidObject = item;
        this.showSelectSSIDError = false;
        this.getBlockChainData();
        return;
      } {
        Swal.fire('Client ID Status -  Pending', 'Kindly wait for approval or select approved Client ID');
      }
    });
  }


  selectWallet(item, chain) {
    console.log(item, chain);
    this.common.selectedWalletPrivateKey = item.key;
    this.selectedWalletPrivateKey = item.key;
    this.selectedWalletAddress = item.address;
    this.selectedChain = chain;
    this.common.selectedWalletType = chain;
    this.common.selectedChain = chain;
    this.showSelectMultiKeyError = false;
  }

  checkForKey(key) {
    console.log(key);
    $('.nft_radioItem').removeClass('active');
    //document.getElementById('parent'+key).classList.add('active')
  }

  async getBlockChainData() {
    this.avalaibleBlockChainData = [];
    const id = this.common.selectedSSID;
    this.common.blockChainData.map(async data => {
      const keyName = data.value + 'PrivateKey' + id;
      data.selected = false;
      const obj = await localStorage.getItem(keyName);
      if (obj) {
        data.keys = JSON.parse(obj);
        console.log(data.image);
        this.avalaibleBlockChainData.push(data);
      }
      console.log(this.avalaibleBlockChainData.length);
      if (this.avalaibleBlockChainData.length >= 1) { this.showWalletBtn = false; } else { this.showWalletBtn = true; }

    });
  }


  getBulkNFT() {
    return new Promise<void>((resolve, reject) => {
      this.api.apiProcess({ type: 'getBulkNFTByBatchID', batchID: this.batchID }).subscribe((res: any) => {
        if (res.result.code === 1) {
          this.bulkNFTData = res.result.status;
          if (this.bulkNFTData.status === 'INPROGRESS' || 'DEPLOYING' || 'DEPLOYING') {
            this.checkBulkNFTStatus();
          }
        } else {

          if (this.bulkNFTStatusCheck) {
            this.bulkNFTStatusCheck.unsubscribe();
          }
        }
        resolve();
      });
    });
  };

  checkBulkNFTStatus() {
    this.bulkNFTStatusCheck = interval(10000).subscribe((val) => {
      this.api.apiProcess({ type: 'getBulkNFTByBatchID', batchID: this.batchID }).subscribe((res: any) => {
        if (res.result.code === 1) {
          this.bulkNFTData = res.result.status;
          if (this.bulkNFTData.status === 'MINTED' || this.bulkNFTData.status === 'PREPARED' || this.bulkNFTData.errorOccured) {
            this.bulkNFTStatusCheck.unsubscribe();
          }
        };
      });
    });
  }


  deployNFT() {
    this.link = this.baselink + this.bulkNFTData.ipfsFolderName + '/metadata/{id}.json';
    this.api.apiProcess({
      type: 'deployAndMintBulkNFT',
      batchID: this.batchID,
      address: this.selectedWalletAddress,
      blockchain: this.selectedChain,
      ssid: this.common.ssidObject.ssid,
      ssidName: this.common.ssidObject.name,
    }).subscribe((res: any) => {
      console.log('>>>>>>>>>>>>serendipity', this.selectedWalletAddress);
      this.bulkNFTData = res.result.status.data;
      $('#myModal').modal('hide');
      this.toast.show('success', 'Batch Deply Request Sent Successfully', 'it will take a while to batch deploy..');
      this.router.navigate(['/bulk-nft/list-bulk-nft']);
      // this.checkBulkNFTStatus();
    });
  }

  async getEstimateFee() {
    this.common.loaderText = 'fetching selected wallet balance and estimated fees to Import...  ';
    this.loader.show();
    const result: any = await this.api.apiProcess({
      type: 'feeEstimate',
      blockchain: this.selectedChain,
      address: this.selectedWalletAddress,
      action: 'bulk',
      tofID: this.batchID,
      maxCount: this.bulkNFTData.preparedNFTCount
    }).toPromise();
    this.loader.hide();
    this.common.loaderText = 'fetching data...  ';
    console.log('fee estimate is', result);
    this.feeDetails = result.result.status.result;
    this.tickerID = this.feeDetails.estimate.id;
    this.feesEstimateRetry();
  }

  reduceCount() {
    if (this.feeEstimateTimerCount <= 0) {
      this.waitBeforeSendingAgain = false;
    } else {
      this.feeEstimateTimerCount--;
    }
  }

  feesEstimateRetry() {
    const reset = 30;
    this.feeEstimateTimerCount = reset;
    console.log(this.feeEstimateTimerCount);
    this.waitBeforeSendingAgain = true;
    this.feesEstimateInterval = setInterval(() => { this.reduceCount(); }, 1000);
  }

  ngOnDestroy(): void {
    if (this.bulkNFTStatusCheck) {
      this.bulkNFTStatusCheck.unsubscribe();
    }
  }
}
