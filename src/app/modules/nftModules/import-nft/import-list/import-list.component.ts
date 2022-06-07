/* eslint-disable @typescript-eslint/prefer-for-of */
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiService } from '../../../../services/apiServices/api.service';
import { CommonService } from '../../../../services/common/common.service';
import { NetworkService } from '../../../../services/network/network.service';
import { SpinnerService } from '../../../../services/spinner/spinner.service';
import { ToastrServiceService } from '../../../../services/toastr/toastr-service.service';
import { RaiseTicketComponent } from '../../../../shared/components/raise-ticket/raise-ticket.component';

declare let $: any;

@Component({
  selector: 'app-import-list',
  templateUrl: './import-list.component.html',
  styleUrls: ['./import-list.component.scss']
})
export class ImportListComponent implements OnInit {

  unsecuredNFTList = [];
  securedNFTList = [];
  importNftList = [];
  public isUnsecuredSelected = true;
  public selectedNFTS: any = [];

  constructor(
    public common: CommonService,
    private networkService: NetworkService,
    private router: Router,
    public dialog: MatDialog,
    public loader: SpinnerService,
    private toast: ToastrServiceService,
    private api: ApiService
  ) { }

  ngOnInit(): void {
    console.log(this.common.unsecureImportList);
    if (this.common.unsecureImportList.length >= 1 || this.common.securedImportList.length >= 1) {
      this.unsecuredNFTList = this.common.unsecureImportList;
      this.securedNFTList = this.common.securedImportList;
      this.importNftList = this.unsecuredNFTList;
      this.fetchUnsecuredMetaData();
      this.fetchSecuredMetaData();
    } else {
      this.router.navigate(['/import-nft']);
    }
  }



  async fetchUnsecuredMetaData() {
    for (let index = 0; index < this.unsecuredNFTList.length; index++) {
      this.unsecuredNFTList[index].existsInDB = await this.checkIfNFTAlreadyExistsInDB(this.unsecuredNFTList[index]);
      if (!this.unsecuredNFTList[index].imageUrl) {
        if (this.unsecuredNFTList[index].metadata) {
          this.unsecuredNFTList[index] = { ...this.unsecuredNFTList[index], ...JSON.parse(this.unsecuredNFTList[index].metadata) };
          this.unsecuredNFTList[index].imageUrl = this.unsecuredNFTList[index].image;

        } else {
          await this.delay(1000);
          const temp: any = await this.networkService.getNFTMetadata(this.unsecuredNFTList[index].token_uri);
          this.unsecuredNFTList[index].imageUrl = temp.image;
        }

      }
    }
  }

  async fetchSecuredMetaData() {
    for (let index = 0; index < this.securedNFTList.length; index++) {
      this.securedNFTList[index].existsInDB = await this.checkIfNFTAlreadyExistsInDB(this.securedNFTList[index]);
      if (!this.securedNFTList[index].imageUrl) {
        if (this.unsecuredNFTList[index]?.metadata) {
          this.securedNFTList[index] = { ...this.securedNFTList[index], ...JSON.parse(this.securedNFTList[index].metadata) };
          this.securedNFTList[index].imageUrl = this.securedNFTList[index].image;

        } else {
          await this.delay(1000);
          const temp: any = await this.networkService.getNFTMetadata(this.securedNFTList[index].token_uri);
          this.securedNFTList[index].imageUrl = temp.image;
        }
      }
    }
  }


  async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  unsecuredNft() {
    this.importNftList = [];
    this.importNftList = this.unsecuredNFTList;
    $('.unsecurednftbtn1').addClass('active');
    $('.securednftbtn1').removeClass('active');
  }

  securedNft() {
    this.importNftList = [];
    this.importNftList = this.securedNFTList;
    $('.securednftbtn1').addClass('active');
    $('.unsecurednftbtn1').removeClass('active');
  }

  async checkForApproval(nft) {
    console.log(nft.token_id);
    // $('#showNetwork').modal('show');
    const resp: any = await this.api.apiProcess({
      type: 'getRecentRequestByAssetID',
      // assetID: '123'
      assetID: nft.token_id
    }).toPromise();
    const latestRequest = resp.result.status.data;

    if (!latestRequest[0]) {
      // raise Ticket Modal
      this.importselectedNFT(nft);
      //  $('#showRaiseTicketModal').modal('show');
    }
    else {
      if (latestRequest[0].status === 'APPROVED') {
        this.toast.show('success', 'Request is already approved for this asset',
          'Import this Asset from Requests Section..');
        this.router.navigate(['/request']);
        //  $('#showNetwork').modal('show');
        return;
      }
      else if (latestRequest[0].status === 'REJECTED') {
        this.toast.show('warning', 'last Request for this Asset was Rejected',
          'Raise a new Request to import this NFT..');
        this.importselectedNFT(nft);
        //  $('#showRaiseTicketModal').modal('show');
        return;
      } else {
        this.toast.show('warning', 'voting is not yet Completed for this NFT Request',
          'Please wait for it to Complete..');
      }
    }
  }

  async quickImport(nft, index) {

    try {

      this.loader.show();
      this.common.loaderText = 'securing NFT to wallet..';

      const resp: any = await this.api.apiProcess({
        type: 'quickImportNFT',
        nftData: nft,
        ssid: this.common.ssidObject.ssid,
        ssidName: this.common.ssidObject.name,
        ownerAddress: this.common.selectedWalletAddress,
        blockchain: this.common.selectedChain
      }).toPromise();
      console.log({ resp });
      this.loader.hide();
      if (resp.result.status.code) {
        this.importNftList[index].existsInDB = true;
        this.toast.show('success', resp.result.status.message,
          resp.result.status.message);
      }
    } catch (error) {
      this.loader.hide();
      this.toast.show('error', 'failed to secure NFT in wallet',
        'please try again in some time');
    }
  }

  async checkIfNFTAlreadyExistsInDB(nft) {
    const resp: any = await this.api.apiProcess({
      type: 'checkIfNFTAlreadyExistsInDB',
      tokenID: nft.token_id,
      ownerAddress: this.common.selectedWalletAddress,
      blockchain: this.common.selectedChain
    }).toPromise();
    return resp.result.status.data;

  }

  importselectedNFT(nft) {
    console.log(nft);
    const dialogRef = this.dialog.open(RaiseTicketComponent, {
      data: { ...nft, type: 'import' },
      height: 'auto',
      width: '600px',
      panelClass: 'ListingPreview',
    });

    dialogRef.afterClosed().subscribe(item => {
      console.log('response back from dialog', item);
    });
  }

  getSelectedNFT(index) {
    if (this.importNftList[index].symbol !== 'RWSCT') {
      this.selectedNFTS.forEach(sel => {
        this.importNftList = this.importNftList.map(all => {
          if (sel.token_id === all.token_id) {
            all.selected = !all.selected;
          }
          return all;
        });
      });
      this.importNftList[index].selected = !this.importNftList[index].selected;
    } else {
      // this.toast.show('warning', 'You cannot select already Secured NFT', '');
    }
    this.selectedNFTS = this.importNftList.filter(((nft) => nft.selected === true));
  }

}
