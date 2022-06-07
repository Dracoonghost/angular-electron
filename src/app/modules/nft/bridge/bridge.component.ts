import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/apiServices/api.service';
import { BlockChainService } from '../../../services/blockChain/block-chain.service';
import { CommonService } from '../../../services/common/common.service';
import { PgpCryptoService } from '../../../services/crypto/pgp-crypto.service';
import { HashFileService } from '../../../services/fs/hash-file.service';
import { SpinnerService } from '../../../services/spinner/spinner.service';
declare let $: any;

@Component({
  selector: 'app-bridge',
  templateUrl: './bridge.component.html',
  styleUrls: ['./bridge.component.scss']
})
export class BridgeComponent implements OnInit {
  avalaibleBlockChainData: any = [];
  selectedWalletPrivateKey: any;
  selectedChain: any;
  showScreen = 1;
  myProfileID = localStorage.getItem('profileID');
  selectedSSID = null;
  selectedWalletAddress: string;
  allSsidList = [];
  userPrivateKey;
  showSelectMultiKeyError = false;
  selctedNFTS: any = [];
  showSignError = false;
  showSelectSSIDError = false;
  bridgeData: any;
  currentBlockchain: any;
  nftData;


  constructor(
    private api: ApiService,
    private router: Router,
    public common: CommonService,
    public fileHash: HashFileService,
    private blockChain: BlockChainService,
    private loader: SpinnerService,
    private pgp: PgpCryptoService) {
    {
      if (this.router.getCurrentNavigation()) {
        if (this.router.getCurrentNavigation().extras.state) {
          console.log(this.router.getCurrentNavigation().extras.state);

          this.nftData = this.router.getCurrentNavigation().extras.state.nftData;
          this.selectedSSID = this.nftData.ssid;
        }
      }
    }
  }

  async ngOnInit(): Promise<void> {
    console.log(this.selectedSSID);

    if (!this.selectedSSID) {
      await this.getAllSsids();
      $('#myModalSsidList').modal('show');
    } else {
      this.getBlockChainData();
      this.getAllBridges();
    }
    this.common.updateWalletKeys.subscribe(data => {
      console.log(data);
      if (data) {
        this.getBlockChainData();
      }
    });
    this.getAllBridges();
  }

  async getBlockChainData() {
    this.avalaibleBlockChainData = [];
    this.common.blockChainData.map(async data => {
      const keyName = data.value + 'PrivateKey' + this.selectedSSID;
      data.selected = false;
      const obj = await localStorage.getItem(keyName);
      if (obj) {
        data.keys = JSON.parse(obj);
        console.log(data.image);
        this.avalaibleBlockChainData.push(data);
      }
      // if (this.avalaibleBlockChainData.length >= 1) { this.showWalletBtn = false; } else { this.showWalletBtn = true; }
    });
    console.log(this.avalaibleBlockChainData, this.avalaibleBlockChainData.length);
  }

  async getAllSsids(): Promise<void> {
     this.loader.show();
     this.common.loaderText='Fetching Client ID details..';
    const res: any = await this.api.apiProcess({ type: 'getAllSSID', profileID: this.myProfileID }).toPromise();
    console.log('my ssid Data', res);
     this.loader.hide();
    this.allSsidList = res.result.status.data;
  }

  getUserKeys() {
    this.userPrivateKey = localStorage.getItem(`ssid-${this.selectedSSID}-privateKey`);
    // this.userPublicKey = localStorage.getItem(`ssid-${this.selectedSSID}-publicKey`);
  }

  async checkForKey(key) {
    console.log(key);
    $('.nft_radioItem').removeClass('active');
    //document.getElementById('parent'+key).classList.add('active')
  }

  selectWallet(item, chain) {
    console.log(item, chain);
    this.selectedWalletAddress = item.address;
    this.common.selectedWalletPrivateKey = item.key;
    this.selectedWalletPrivateKey = item.key;
    this.selectedChain = chain;
    this.common.selectedWalletType = chain;
    this.common.selectedChain = chain;
    this.showSelectMultiKeyError = false;
  }

  selectSSID(item?) {
    if (item.status === 'APPROVED') {
      console.log(this.selectedSSID);
      this.selectedSSID = item.ssid;
      this.common.ssidObject = item;
      $('#myModalSsidList').modal('hide');
      // this.showSelectSSIDError = false;
      this.getUserKeys();
      this.getBlockChainData();
      return;
    } {
      // Swal.fire('SSID Status -  Pending ', 'Kindly wait for approval or select Approved SSID');
    }

  }

  async getAllBridges() {
    this.loader.show();
    this.common.loaderText='Fetching list of avaliable bridges..';
    const result: any = await this.api.apiProcess({
      type: 'listAvailableBridges',
    }).toPromise();
    this.loader.hide();
    console.log(this.avalaibleBlockChainData,'bridge result is', result.result.status.result);
    this.bridgeData = result.result.status.result;
    if(this.avalaibleBlockChainData.length !== 0){
      this.currentBlockchain = this.avalaibleBlockChainData[0].value;
    }

  }

  async sendWalletDetails(value1, value2) {
    console.log('wallet data', value1, value2);

    this.nftData.blockchain = value2;
    console.log(this.nftData);

    this.nftData.tokenURI = `https://gateway.pinata.cloud/ipfs/` + this.nftData.IPFSHash;
    this.nftData.address = this.selectedWalletAddress;

    const bridgeData = await this.blockChain.importNFT(String(this.nftData.tokenID.toLocaleString('fullwide', {useGrouping:false})),
      this.nftData.contractAddress, this.selectedWalletPrivateKey, this.nftData.contractType,null,'ETH');

    console.log({ type: 'bridgeNFT', NFT: {...this.nftData, bridgeData} });

    if (bridgeData) {
      const res: any = await this.api.apiProcess({
        type: 'bridgeNFT', NFT:
        {...this.nftData, bridgeData }
      }).toPromise();
      if (res) {
        // await this.loader.hideLoader('NFTCN');
        // await this.loader.hideAllLoaders();

        // this.NFT = res.result.status.result.result;
        // this.common.NFT = res.result.status.result.result;
        console.log(res);
        // this.loader.hide();
      } else {
        console.log('ERROR IN BC', this.nftData.tokenID);

      }
    }

  }

}
