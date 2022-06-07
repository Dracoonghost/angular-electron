import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/apiServices/api.service';
import { CommonService } from '../../services/common/common.service';
import { SpinnerService } from '../../services/spinner/spinner.service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Router } from '@angular/router';
import { NetworkService } from '../../services/network/network.service';
import { AclStorageService } from '../../services/acl-storage/acl-storage.service';
declare let $: any;


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  myProfileID = localStorage.getItem('profileID');
  myProfile: any = JSON.parse(localStorage.getItem('myProfile'));
  eventHistory = [];
  nftList: any = [];
  allSsidList: any;
  nftLoading = true;
  skipNFT: any = 0;
  singlePaymentData;
  pageCount = 1;
  ssidnftList: any;
  nftSearchResults = [];
  public dd: any;
  imgQRt: any;
  mydata: any;
  public pendingClientsCount = 0;

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    center: false,
    margin: 20,
    navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 2,
      },
      1000: {
        items: 3,
      }
    }
  };

  constructor(
    public common: CommonService,
    private api: ApiService,
    private spinner: SpinnerService,
    private router: Router,
    private network: NetworkService,
    public acl: AclStorageService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.spinner.show();
    this.common.loaderText = 'Fetching DLT history..';
    let resp: any = await this.api.apiProcess({ type: 'getEventHistory', skip: 0, limit: 10 }).toPromise();
    this.eventHistory = resp.result.status.history.reverse();
    this.common.loaderText = 'Fetching profile info..';
    resp = await this.api.apiProcess({ type: 'getInfo' }).toPromise();

    if (resp) {
      localStorage.setItem('myProfile', JSON.stringify(resp.result.status));
      this.spinner.hide();
    }
    this.getAllSsids();
    await this.getallNFTS();

    $('#recipeCarousel').carousel({
      interval: 10000
    });

    $('.carousel .carousel-item').each(function() {
      const minPerSlide = 3;
      let next = $(this).next();
      if (!next.length) {
        next = $(this).siblings(':first');
      }
      next.children(':first-child').clone().appendTo($(this));

      for (let i = 0; i < minPerSlide; i++) {
        next = next.next();
        if (!next.length) {
          next = $(this).siblings(':first');
        }

        next.children(':first-child').clone().appendTo($(this));
      }
    });
  }

  async getAllSsids() {
    const res: any = await this.api.apiProcess(
      { type: 'getAllSSID' }).toPromise();
    console.log('my ssid Data', res);
    this.allSsidList = res.result.status.data;
    this.pendingClientsCount = this.allSsidList.filter(item =>
      item.status === 'PENDING'
    ).length;
  }

  async downloadME() {
    console.log(this.myProfile);

    // delete localStorage.currentJWT;
    //delete localStorage.myProfile;
    console.log(Object.keys(localStorage));
    const keys = {};
    const okeys = Object.keys(localStorage);
    for (let index = 0; index < okeys.length; index++) {
      keys[okeys[index]] = localStorage[okeys[index]];

    }
    console.log(keys);

    const resp: any = await this.network.bulkWriteLocalstorage(
      this.myProfile.firstName, this.myProfile.email, keys);
    console.log(resp);

  }

  goToNFTPreview(data) {
    this.common.NFT = data;
    this.router.navigate(['/create-nft/previewNFT']);
  }

  async getallNFTS() {
    // this.spinner.show();
    this.common.loaderText = 'Fetching all NFTs..';
    this.nftLoading = true;
    const result: any = await this.api.apiProcess({
      type: 'getNFT',
      fetchType: 'mine',
      profileID: this.myProfileID
    }).toPromise();
    const limitPaments = result?.result?.status?.result.splice(0, 10);
    this.nftLoading = false;
    this.nftList = limitPaments;
    this.spinner.hide();
  }

  async searchNfts(search?) {
    const result: any = await this.api.apiProcess({
      type: 'searchWithTerm',
      term: search.toLowerCase(),
      size: 10,
      offset: 0,
      searchType: 'NFT'
    }).toPromise();

    if (result?.result?.status?.NFTs?.body?.hits?.hits.length <= 0) {
      console.log('No NFTS matching your criteria');
    } else {
      const filteredByProfileID = result?.result?.status?.NFTs?.body?.hits?.hits
        // eslint-disable-next-line no-underscore-dangle
        .filter((singleProfile) => singleProfile?._source?.profileID === this.myProfileID);

      this.nftSearchResults = filteredByProfileID;
      this.router.navigate(['/nft/search'], { state: { searchResults: this.nftSearchResults } });
    }
  }

  goToSelectedSSID(ssid) {
    this.router.navigate(['/ssid/create'], { state: { newSSID: false, ssid } });
  }

}
