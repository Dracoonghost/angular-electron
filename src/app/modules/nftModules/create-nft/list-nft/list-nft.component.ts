import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../../services/apiServices/api.service';
import { CommonService } from '../../../../services/common/common.service';
import { SpinnerService } from '../../../../services/spinner/spinner.service';
declare let $: any;

@Component({
  selector: 'app-list-nft',
  templateUrl: './list-nft.component.html',
  styleUrls: ['./list-nft.component.scss']
})
export class ListNftComponent implements OnInit {

  public skipNFT: any = 0;
  public nftList: any = [];
  public nftLoading = true;
  public myProfileID = localStorage.getItem('profileID');
  public nftSearchResults = [];
  public pageCount = 1;
  public lastPage;
  public nextPage;
  public buttonDisabled;
  public allNftsButton;

  constructor(
    private api: ApiService,
    private common: CommonService,
    private spinner: SpinnerService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.getallNFTS(this.pageCount);
    $('.tabsSpan button.btn-primary').on('click', function () {
      $('.tabsSpan button.btn-primary').removeClass('active');
      $(this).addClass('active');
    });
  }

  async getallNFTS(pageNo?) {
    this.pageCount = pageNo;
    this.allNftsButton = true;

    this.spinner.show();
    this.common.loaderText = 'Fetching NFTs...';
    this.nftLoading = true;
    const result: any = await this.api.apiProcess({
      type: 'getNFT',
      fetchType: 'mine',
      profileID: this.myProfileID,
      page: this.pageCount,
    }).toPromise();
    this.nftLoading = false;
    this.nftList = [...this.nftList, ...result.result.status.result];
    this.lastPage = Math.ceil(result?.result?.status?.count / 10);
    this.nextPage = this.pageCount + 1;

    if (this.lastPage + 1 === this.nextPage) {
      this.buttonDisabled = true;
    }
    this.spinner.hide();
  }


  async getBulkNft() {
    this.allNftsButton = false;
    this.spinner.show();
    this.common.loaderText = 'Fetching all bulk NFTs..';
    const result: any = await this.api.apiProcess({
      type: 'getBulkNft',
      profileID: this.myProfileID
    }).toPromise();

    this.nftList = result.result.status;
    this.spinner.hide();
  }

  async getSingleNft() {
    // this.spinner.show();
    this.allNftsButton = false;
    this.common.loaderText = 'Fetching all NFTs..';
    const result: any = await this.api.apiProcess({
      type: 'getNFT',
      fetchType: 'singleNFT', skip: 0, limit: 20, profileID: this.myProfileID
    }).toPromise();
    this.nftList = result.result.status;
  }

  preview(data) {
    this.common.NFT = data;
    this.router.navigate(['/create-nft/previewNFT']);
  }

  async searchNfts(search?) {
    this.spinner.show();
    this.common.loaderText = 'Searching NFTs..';
    const result: any = await this.api.apiProcess({
      type: 'searchWithTerm',
      term: search.toLowerCase(),
      size: 10,
      offset: 0,
      searchType: 'NFT'
    }).toPromise();

    if (result?.result?.status?.NFTs?.body?.hits?.hits.length <= 0) {
      this.spinner.hide();
      // console.log('No NFTS matching your criteria');
    } else {
      const filteredByProfileID = result?.result?.status?.NFTs?.body?.hits?.hits
        .filter((singleProfile) => singleProfile?._source?.profileID === this.myProfileID);

      this.nftSearchResults = filteredByProfileID;
      this.router.navigate(['/nft/search'], { state: { searchResults: this.nftSearchResults } });
      this.spinner.hide();
    }
  }
}
