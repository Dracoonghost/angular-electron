/* eslint-disable @typescript-eslint/no-shadow */
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/apiServices/api.service';
import { CommonService } from '../../../services/common/common.service';
import { PgpCryptoService } from '../../../services/crypto/pgp-crypto.service';
import { SpinnerService } from '../../../services/spinner/spinner.service';
import { ToastrServiceService } from '../../../services/toastr/toastr-service.service';
declare let $: any;
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CreateClientComponent } from '../utils/create-client/create-client.component';
import { MatDialog } from '@angular/material/dialog';
import { AvaliableBlockChainComponent } from '../../../shared/components/avaliable-block-chain/avaliable-block-chain.component';
import { RaiseTicketComponent } from '../../../shared/components/raise-ticket/raise-ticket.component';
@Component({
  selector: 'app-ssid-list',
  templateUrl: './ssid-list.component.html',
  styleUrls: ['./ssid-list.component.scss'],
})
export class SsidListComponent implements OnInit {
  showScreen = 1;
  ssidForm: FormGroup;
  myProfileID = localStorage.getItem('profileID');
  allSsidList = [];
  avalaibleBlockChainData: any;
  selectedValue: any;
  featchingClients = false;
  generateKeysText = 'Generate Keys and Proceed';
  fieldTextType: boolean;
  fieldPswdType: boolean;

  username = '';
  testArray: any[] = [];
  showInputBox = false;
  public labels: any = [];
  public searchTags: any = [];
  public selectedSSIDIndex;
  public selectedLabels = [];
  public searchText = '';
  searchTag: FormControl;
  search: FormControl;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private api: ApiService,
    private common: CommonService,
    public loader: SpinnerService,
    public pgpCryptoService: PgpCryptoService,
    private toast: ToastrServiceService,
    private dialog: MatDialog
  ) {
    this.ssidForm = this.formBuilder.group({
      name: ['', Validators.required],
      key: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  async ngOnInit(): Promise<void> {
    this.searchTag = new FormControl();
    this.searchTag.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((text) => {
        this.searchlabels(text, 'searchTags');
      });

    this.search = new FormControl();
    this.search.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((text) => {
        if (this.selectedValue === text) {
          return;
        }
        this.searchlabels(text, 'search');
      });

    await this.getAllSsids('');
    $(document).ready(function() {
      $('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover',
      });
    });
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  toggleFieldPswdType() {
    this.fieldPswdType = !this.fieldPswdType;
  }

  async updateLabels() {
    this.loader.show();
    this.common.loaderText = 'updating Labels';
    console.log(this.selectedLabels, this.selectedSSIDIndex);
    const resp: any = await this.api
      .apiProcess({
        type: 'updateLabelsInSSID',
        labels: this.selectedLabels,
        ssid: this.allSsidList[this.selectedSSIDIndex].ssid,
      })
      .toPromise();
    if (resp.result.status.code === 1) {
      this.allSsidList[this.selectedSSIDIndex].labels = this.selectedLabels;
      this.toast.show(
        'success',
        'labels update Successfully',
        'labels update Successfully'
      );
      this.labels = [];
      this.selectedLabels = [];
      this.loader.hide();
      this.common.loaderText = 'Loading...';
      $('#labels-modal').modal('hide');
    } else {
      this.toast.show(
        'error',
        'failed to update labels',
        'please try again with in some time.'
      );
      this.loader.hide();
      this.common.loaderText = 'Loading...';
      $('#labels-modal').modal('hide');
    }
  }

  assignValueToSearchForm(value) {
    console.log(value);

    this.selectedValue = value;
    this.search.setValue(value);
    this.searchTags = [];
  }

  async searchlabels(event, type?) {
    const term = event;
    if (term.length <= 0) {
      this.labels = [];
      this.searchTags = [];
      return;
    }
    if (term.length > 2) {
      const searchResult: any = await this.api
        .apiProcess({
          type: 'searchLabels',
          text: term.toLowerCase(),
          limit: 10,
        })
        .toPromise();
      console.log(searchResult);
      if (searchResult.result.status.code === 0) {
        return;
      }
      if (type === 'searchTags') {
        this.labels = searchResult.result.status.data;
        this.labels.push({ _id: term });
      } else {
        this.searchTags = searchResult.result.status.data;
        this.searchTags.push({ _id: term });
        this.selectedValue = '';
      }
    }
  }

  selectTag(tag) {
    if (!this.selectedLabels.includes(tag)) {
      this.selectedLabels.push(tag);
      this.labels = [];
    }
  }

  removeTag(tag) {
    this.selectedLabels = this.selectedLabels.filter((item) => item !== tag);
  }

  closeLabelModal() {
    this.selectedLabels = [];
    this.labels = [];
  }

  async getBlockChainData() {
    this.loader.show();
    this.avalaibleBlockChainData = [];
    const id = this.common.selectedSSID;
    this.common.blockChainData.map(async (data) => {
      const keyName = data.value + 'PrivateKey' + id;
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
    this.loader.hide();
    this.common.loaderText = 'Loading...';
  }

  async getAllSsids(searchText): Promise<void> {
    console.log(searchText);
    this.loader.show();
    this.featchingClients = true;
    this.common.loaderText = 'Fetching Clients...';
    const res: any = await this.api
      .apiProcess({ type: 'getAllSSID', searchText: this.selectedValue })
      .toPromise();
    console.log('my ssid Data', res);
    this.allSsidList = res.result.status.data;
    this.featchingClients = false;
    this.getAllBlockchainsList();
    this.loader.hide();
    this.common.loaderText = 'Loading...';
  }

  getAllBlockchainsList() {
    this.allSsidList.forEach((element) => {
      console.log(element);
      element.avalaibleBlockChainData = [];
      const id = element.ssid;

      this.common.blockChainData.map(async (data) => {
        element.avalaibleBlockChainData = [];
        const keyName = data.value + 'PrivateKey' + id;
        const obj = await localStorage.getItem(keyName);
        if (obj) {
          data.keys = JSON.parse(obj);
          element.avalaibleBlockChainData.push(data);
        }
      });
    });
  }

  resetClient() {
    this.search.setValue('');
    this.selectedValue = '';
    this.getAllSsids('');
  }

  openCrypto(ssid) {
    console.log(ssid);
    this.common.ssidObject = ssid;
    this.common.selectedSSID = ssid.ssid;
    const dialogRef = this.dialog.open(AvaliableBlockChainComponent, {
      disableClose: true,
      height: 'auto',
      width: '900px',
      panelClass: 'ListingPreview',
      data: {
        type: 'create',
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getAllBlockchainsList();
    });
  }

  goToSelectedSSID(ssid) {
    this.router.navigate(['/ssid/create'], { state: { newSSID: false, ssid } });
  }

  createSSIDDialog() {
    const dialogRef = this.dialog.open(CreateClientComponent, {
      disableClose: true,
      height: 'auto',
      width: '700px',
      panelClass: 'ListingPreview',
    });

    dialogRef.afterClosed().subscribe((item) => {
      console.log('response back from dialog', item);
      return item;
    });
  }

  walletDialog(ssid) {
    this.common.ssidObject = ssid;
    this.common.selectedSSID = ssid.ssid;
    const dialogRef = this.dialog.open(AvaliableBlockChainComponent, {
      disableClose: true,
      height: 'auto',
      width: '900px',
      panelClass: 'ListingPreview',
      data: {
        type: 'view',
      },
    });

    dialogRef.afterClosed().subscribe((item) => {
      this.getAllBlockchainsList();
    });
  }

  resetAndHideShowInputBox(data) {
    this.showInputBox = data;
    this.username = '';
  }

  addDataToList() {
    const checkLowerCase = this.username.toLowerCase().trim();
    const val = this.testArray.some((data: string) => data.toLowerCase().trim() === checkLowerCase);

    if (checkLowerCase !== '' && !val) {
      this.testArray.push(this.username.trim());
      this.showInputBox = false;
    }
    this.username = '';
  }

  removeTestData(data) {
    if (this.testArray.length > 0) {
      this.testArray = this.testArray.filter((testData) => testData !== data);
      return this.testArray;
    }
  }

  openRaiseRequestModal() {
    this.common.selectedSSID = this.allSsidList[this.selectedSSIDIndex].ssid;
    this.common.ssidObject = this.allSsidList[this.selectedSSIDIndex];
    const dialogRef = this.dialog.open(RaiseTicketComponent, {
      data: { ...this.allSsidList[this.selectedSSIDIndex], whiteListedAddresses: this.testArray, type: 'whiteList' },
      height: 'auto',
      width: '600px',
      panelClass: 'ListingPreview',
    });

    dialogRef.afterClosed().subscribe(item => {
      console.log('response back from dialog', item);
    });
  }
}
