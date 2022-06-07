/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../services/common/common.service';
import { SpinnerService } from '../../../services/spinner/spinner.service';
import { ApiService } from '../../../services/apiServices/api.service';

@Component({
  selector: 'app-search-nfts',
  templateUrl: './search-nfts.component.html',
  styleUrls: ['./search-nfts.component.scss']
})

export class SearchNftsComponent implements OnInit {
  myProfileID = localStorage.getItem('profileID');
  searchResults = [];

  constructor(
    private router: Router,
    private common: CommonService,
    private api: ApiService,
    private spinner: SpinnerService
  ) {
    if (this.router.getCurrentNavigation()) {
      if (this.router.getCurrentNavigation().extras.state) {
        this.searchResults = this.router.getCurrentNavigation().extras.state.searchResults;
      }
    }
  }

  ngOnInit(): void {
  }
  async searchNfts(search?) {
    this.spinner.show();
    this.common.loaderText='Searching NFTs..';
    const result: any = await this.api.apiProcess({
      type: 'searchWithTerm',
	    term: search.toLowerCase(),
	    size: 10,
	    offset: 0,
	    searchType: 'NFT'
    }).toPromise();

    if(result?.result?.status?.NFTs?.body?.hits?.hits.length <= 0) {
      this.spinner.hide();
      // console.log('No NFTS matching your criteria');
    } else {
      const filteredByProfileID = result?.result?.status?.NFTs?.body?.hits?.hits
      .filter((singleProfile) => singleProfile?._source?.profileID === this.myProfileID);

      this.searchResults = filteredByProfileID;
      this.spinner.hide();
    }
  }
  preview(data) {
    this.common.NFT = data;
    this.router.navigate(['/nft/preview']);
  }
}
