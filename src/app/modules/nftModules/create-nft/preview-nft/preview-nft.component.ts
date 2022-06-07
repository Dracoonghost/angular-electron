/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { HashFileService } from '../../../../services/fs/hash-file.service';
import { ApiService } from '../../../../services/apiServices/api.service';
import { BlockChainService } from '../../../../services/blockChain/block-chain.service';
import { CommonService } from '../../../../services/common/common.service';
import { NetworkService } from '../../../../services/network/network.service';
import { SpinnerService } from '../../../../services/spinner/spinner.service';
import Swal from 'sweetalert2';
import { ToastrServiceService } from '../../../../services/toastr/toastr-service.service';
import { MatDialog } from '@angular/material/dialog';
import { AvaliableSSIDComponent } from '../../../../shared/components/avaliable-ssid/avaliable-ssid.component';
import { CertificateNftComponent } from '../../../../shared/components/certificate-nft/certificate-nft.component';
import { InvoiceComponent } from '../../../../shared/components/invoice/invoice.component';
import { AvaliableBlockChainComponent } from '../../../../shared/components/avaliable-block-chain/avaliable-block-chain.component';
import { TransferNftComponent } from '../../transfer-nft/transfer-nft.component';
import { APP_CONFIG } from '../../../../../environments/environment';
declare let $: any;
declare let google: any;

@Component({
  selector: 'app-preview-nft',
  templateUrl: './preview-nft.component.html',
  styleUrls: ['./preview-nft.component.scss']
})
export class PreviewNftComponent implements OnInit, OnDestroy {

  public nftData: any;
  public feeEstimateTimerCount: number;
  public feeDetails: any;
  public allSsidList: any = [];
  public userPrivateKey;
  public myDate: any;
  public storjData: any;
  public myProfileID = localStorage.getItem('profileID');
  public avalaibleSelectedChainWallets: any = [];
  public selectedWalletAddress: any;
  public selectedChain: any;
  public selectedWalletObject;
  public bridgeData: any = {};
  public currentBlockchain: any;
  public showSelectSSIDError = false;
  public avalaibleBlockChainData: any = [];
  public showWalletBtn = false;
  public waitBeforeSendingAgain = false;
  public showEditBtnNFT = false;
  public feesEstimateInterval;
  public tickerID;
  public copyText = 'click to copy';
  public resultPageURL = 'https://tob.theotherfruit.io/sportal/';
  transferToAddress;

  constructor(
    public common: CommonService,
    public router: Router,
    public fileHash: HashFileService,
    public api: ApiService,
    private blockChain: BlockChainService,
    private datePipe: DatePipe,
    private loader: SpinnerService,
    private toast: ToastrServiceService,
    private networkService: NetworkService,
    public dialog: MatDialog
  ) {
    this.myDate = new Date();
    this.myDate = this.datePipe.transform(this.myDate, 'yyyy-MM-dd');

    // this.router.events.subscribe((event) => {
    //   console.log(event);

    //   if (event instanceof NavigationStart) {
    //     console.log('NavigationStart');
    //     if (!this.common.editNFT) {
    //       this.common.NFT = {};
    //     }
    //   }
    // });
  }
  async ngOnInit(): Promise<void> {
    this.common.editNFT = false;
    if (this.common.NFT) {
      this.nftData = this.common.NFT;
      console.log(this.nftData);
      console.log(this.common.selectedSSID);
    } else {
      this.backToCreate();
    }

    if (this.nftData?.history) {
      this.common.selectedSSID = this.nftData?.ssid;
      this.common.ssidObject = {
        ssid: this.nftData?.ssid,
        name: this.nftData?.ssidName
      };
    }
    else if (!this.common.selectedSSID) {
      this.common.selectedSSID = this.nftData?.ssid;
      this.common.ssidObject = {
        ssid: this.nftData?.ssid,
        name: this.nftData?.ssidName
      };
      if (this.common.selectedSSID === undefined) {
        this.openSSIDDialog();
      }
    }

    this.common.updateWalletKeys.subscribe(data => {
      console.log('UPDATE WALLET KEYS in preview');

      console.log(data);
      if (typeof data === 'object') {
        if (this.nftData) {
          this.nftData.ssidName = data.name;
          this.nftData.ssid = data.ssid;
        }

        // this.getAvailableWallets(this.common.NFT.blockchain, this.selectedChain);
      }
    });

    if (this.nftData) {
      await this.getAllBridges();
      this.getUserKeys();
      if (this.nftData.city) {
        this.mapCall();
      }
      this.getBlockChainData();
    }

    $(function() {
      $('[data-toggle="tooltip"]').tooltip();
    });

    $(window).scroll(function() {
      if ($(window).scrollTop() >= 20) {
        $('.FixedPreviewTable').addClass('fixed');
      }
      else {
        $('.FixedPreviewTable').removeClass('fixed');
      }
    });
  }

  editNF() {
    this.common.editNFT = true;
    this.router.navigate(['/create-nft']);
  }

  openSSIDDialog() {
    const dialogRef = this.dialog.open(AvaliableSSIDComponent, {
      disableClose: true,
      height: 'auto',
      width: '700px',
      panelClass: 'ListingPreview',
    });

    dialogRef.afterClosed().subscribe(item => {
      console.log('response back from dialog right one', item);
      if (!item) { return; };
      if (item.status === 'APPROVED') {
        this.showSelectSSIDError = false;
        this.nftData.ssidName = item.name;
        this.nftData.ssid = item.ssid;
        this.getBlockChainData();
        return;
      } {
        Swal.fire('Client ID Status -  Pending', 'Kindly wait for approval or select approved Client ID');
      }
    });
  }

  openTransferDialog() {
    const dialogRef = this.dialog.open(TransferNftComponent, {
      data: { ssid: this.nftData.ssid, currentOwnerAddress: this.nftData.ownerAddress },
      disableClose: true,
      height: 'auto',
      width: '700px',
      panelClass: 'ListingPreview',
    });

    dialogRef.afterClosed().subscribe(async toAddress => {
      console.log('response back from dialog right one', toAddress);
      if (!toAddress) { return; };
      this.transferToAddress = toAddress;
      await this.getEstimateFeeForTransfer();
      $('#estimateFeesModalTransfer').modal('show');
    });
  }

  async bridgeNFT() {
    this.loader.show();
    // this.common.loaderText = 'Bridge NFT'
    // this.nftData.blockchain = this.selectedChain;
    console.log(this.nftData);

    this.nftData.tokenURI = `https://gateway.pinata.cloud/ipfs/` + this.nftData.IPFSHash;
    this.nftData.address = this.selectedWalletObject.address;
    console.log(String(this.nftData.tokenID.toLocaleString('fullwide', { useGrouping: false })),
      this.nftData.contractAddress, this.selectedWalletObject.key, this.nftData.contractType);
    this.common.loaderText = 'Staking the NFT.. ';

    const [currentOwnerPrivateKey] = this.common.blockChainData.filter(
      (item) => item.value === this.nftData.blockchain)[0].keys.filter((item) =>
        item.address.toLowerCase() === this.nftData.ownerAddress.toLowerCase());
    console.log({ currentOwnerPrivateKey });
    const stakedObject = await this.blockChain.importNFT(String(this.nftData.tokenID.toLocaleString('fullwide', { useGrouping: false })),
      this.nftData.contractAddress, currentOwnerPrivateKey.key, this.nftData.contractType, this.feeDetails, this.nftData.blockchain);
    this.nftData.oldBlockchain = this.nftData.blockchain;
    delete this.nftData.blockchain;
    // this.common.loaderText = 'Bridge Merged'
    console.log({ type: 'bridgeNFT', NFT: { ...this.nftData, stakedObject, blockchain: this.selectedChain } });

    if (stakedObject) {
      // this.common.loaderText = 'Bridge Merging'
      const res: any = await this.api.apiProcess({
        type: 'bridgeNFT', NFT:
        {
          ...this.nftData, stakedObject, oldBlockchain: this.currentBlockchain, blockchain: this.selectedChain,

        }, estimatedFees: this.feeDetails, tickerID: this.tickerID
      }).toPromise();
      if (res.result.status.code) {
        this.nftData = res.result.status.result.NFT;
        this.common.NFT = res.result.status.result.NFT;
        this.getAvailableWallets(this.common.NFT.blockchain, this.selectedChain);
        await this.getAllBridges();
        this.loader.hide();
        $('#BridgeModal').modal('hide');
        $('#BridgeSummaryModal').modal('hide');
        this.toast.show('success', 'NFT Bridged Successfully', 'NFT Bridged Successfully');
        this.common.editNFT = false;
        console.log(res);
      } else {
        this.loader.hide();
        console.log('ERROR IN BC', this.nftData.tokenID);
        this.toast.show('error', 'Failed to Bridge NFT', 'please try again with in some time.');
      }
    }

  }

  async fundWallet() {
    this.common.loaderText = 'Funding the wallet, it will take around a minute to complete...  ';

    this.loader.show();

    const result: any = await this.api.apiProcess({
      type: 'fundWallet',
      blockchain: this.nftData.blockchain,
      to: this.nftData.ownerAddress,
      value: this.feeDetails.differenceInCrypto,
      estimatedFees: this.feeDetails,
      ssid: this.common.ssidObject.ssid,
      ssidName: this.common.ssidObject.name
    }).toPromise();

    this.loader.hide();
    this.common.loaderText = 'fetching data...  ';
    console.log('fee estimate is', result);
    if (result.result.status.code) {
      this.toast.show('success', 'Wallet Funded Sucessfully', 'please wait for around 30 seconds more and then try to fetch Estimate');

      if (this.transferToAddress) {
        this.getEstimateFeeForTransfer();
      } else {
        this.getEstimateFeeForBridge();
      }
    }
  }

  selectWallet(item, chain) {
    console.log(item, chain);

    if (chain === this.nftData.blockchain && item.address === this.nftData.ownerAddress) {
      return;
    }
    this.selectedWalletAddress = item.address;
    this.selectedWalletObject = item;
    this.common.selectedWalletPrivateKey = item.key;
    this.selectedChain = chain;
    this.common.selectedWalletType = chain;
    this.common.selectedChain = chain;
  }

  getAvailableWallets(current, to) {
    console.log(current, to, this.common.blockChainData, this.common.NFT.ownerAddress);
    this.selectedChain = to;
    this.common.selectedSSID = this.common.NFT.ssid;
    this.avalaibleSelectedChainWallets = [];
    this.avalaibleSelectedChainWallets = this.common.blockChainData.filter((item) => item.value === to);
    const keyName = to + 'PrivateKey' + this.common.NFT.ssid;


    let currentOwnerWalletObject;
    this.common.blockChainData.forEach(blockChain => {

      if (blockChain.keys) {
        blockChain.keys.forEach(keys => {
          if (keys.address.toLowerCase() === this.common.NFT.ownerAddress.toLowerCase()) {
            currentOwnerWalletObject = keys;
          }
        });
      }

    });
    console.log({ currentOwnerWalletObject });

    if (!currentOwnerWalletObject) {
      this.toast.show('error', 'unable to find private Key of Owner Address', 'please import the key file again');
      return;
    }

    this.avalaibleSelectedChainWallets[0].keys = JSON.parse(localStorage.getItem(keyName)) || [];
    if (current !== to) {
      this.avalaibleSelectedChainWallets[0].keys.unshift(currentOwnerWalletObject);
    }
    this.selectedWalletObject = null;
    console.log(this.avalaibleSelectedChainWallets, this.avalaibleSelectedChainWallets.length);
  }

  async getAllBridges() {
    this.loader.show();
    const result: any = await this.api.apiProcess({
      type: 'listAvailableBridges',
    }).toPromise();
    this.loader.hide();
    console.log('bridge result is', result.result.status.result);

    if (result.result.status.code === 1) {
      this.currentBlockchain = this.nftData.blockchain;
      this.bridgeData = {};
      this.bridgeData[this.currentBlockchain] = result.result.status.result[this.currentBlockchain];
      console.log(this.currentBlockchain, this.bridgeData);
    } else {
      this.toast.show('error', result.result.status.error, result.result.status.error);
      // SHow Error
    }
  }

  async getEstimateFee() {
    this.common.loaderText = 'fetching selected wallet balance and estimated fees to Mint...  ';
    this.loader.show();
    const filePath = this.nftData?.file?.path;
    const hash: any = await this.networkService.hashFile(filePath);
    const SPORTALID = hash.hash;
    const result: any = await this.api.apiProcess({
      type: 'feeEstimate',
      blockchain: this.nftData.blockchain,
      address: this.nftData.ownerAddress,
      action: 'mint',
      tofID: SPORTALID,
      tofType: 'minting',
      ssid: this.common.ssidObject.ssid,
      ssidName: this.common.ssidObject.name
    }).toPromise();
    this.loader.hide();
    this.common.loaderText = 'fetching data...  ';
    console.log('fee estimate is', result);
    if (result.result.status.result.code === 1) {
      this.feeDetails = result.result.status.result;
      this.tickerID = this.feeDetails.estimate.id;
      this.feesEstimateRetry();
    } else {
      this.toast.show('error', 'Failed to fetch Estimate', 'please try again with in some time.');
      // SHow Error
    }
  }

  getUserKeys() {
    this.userPrivateKey = localStorage.getItem(`ssid-${this.common.selectedSSID}-privateKey`);
  }

  async getEstimateFeeForBridge() {
    this.common.loaderText = 'fetching selected wallet balance and estimated fees to Mint...  ';
    this.loader.show();
    const SPORTALID = this.nftData.hash;
    const result: any = await this.api.apiProcess({
      type: 'feeEstimate',
      blockchain: this.nftData.blockchain,
      address: this.nftData.ownerAddress,
      action: 'bridge',
      tofID: SPORTALID,
      tofType: 'bridge',
      toBlockchain: this.selectedChain,
      ssid: this.common.ssidObject.ssid,
      ssidName: this.common.ssidObject.name

    }).toPromise();
    this.loader.hide();
    this.common.loaderText = 'fetching data...  ';
    console.log('fee estimate is', result);
    this.feeDetails = result.result.status.result;
    this.tickerID = this.feeDetails.estimate.id;
    this.feesEstimateRetry();
  }

  async getEstimateFeeForTransfer() {
    this.common.loaderText = 'fetching selected wallet balance and estimated fees to Transfer...  ';
    this.loader.show();
    const SPORTALID = this.nftData.hash;
    const result: any = await this.api.apiProcess({
      type: 'feeEstimate',
      blockchain: this.nftData.blockchain,
      toBlockchain: this.nftData.blockchain,
      address: this.nftData.ownerAddress,
      action: 'mint',
      tofID: SPORTALID,
      tofType: 'mint',
      ssid: this.common.ssidObject.ssid,
      ssidName: this.common.ssidObject.name
    }).toPromise();
    this.loader.hide();
    this.common.loaderText = 'fetching data...  ';
    console.log('fee estimate is', result);
    this.feeDetails = result.result.status.result;
    this.tickerID = this.feeDetails.estimate.id;
    this.feesEstimateRetry();
  }

  async openBridgeSummary() {
    await this.getEstimateFeeForBridge();
    $('#BridgeSummaryModal').modal('show');
  }

  async transferNFT() {



    const [currentOwnerPrivateKey] = this.common.blockChainData.filter(
      (item) => item.value === this.nftData.blockchain)[0].keys.filter((item) =>
        item.address.toLowerCase() === this.nftData.ownerAddress.toLowerCase());
    console.log({ currentOwnerPrivateKey });

    if (!currentOwnerPrivateKey) {
      this.toast.show('error', 'unable to find private Key of Owner Address', 'please import the key file again');
      return;
    }

    this.common.loaderText = 'Transfering the NFT...  ';
    this.loader.show();
    const transferObject = await this.blockChain.transferNFT(String(this.nftData.tokenID.toLocaleString('fullwide', { useGrouping: false })),
      this.nftData.contractAddress, currentOwnerPrivateKey.key, this.nftData.contractType, this.feeDetails, this.nftData.blockchain, this.transferToAddress);

    if (transferObject) {
      // this.common.loaderText = 'Bridge Merging'
      const res: any = await this.api.apiProcess({
        type: 'transferNFT',
        NFTID: this.nftData.NFTID,
        newOwnerAddress: this.transferToAddress,
        transferObject,
      }).toPromise();
      if (res.result.status.code) {
        this.nftData = res.result.status.data;
        this.common.NFT = res.result.status.data;
        // this.getAvailableWallets(this.common.NFT.blockchain, this.selectedChain);
        // await this.getAllBridges();
        this.loader.hide();
        $('#estimateFeesModalTransfer').modal('hide');
        this.toast.show('success', 'NFT Transfered Successfully', 'NFT Transfered Successfully');
        this.common.editNFT = false;
        console.log(res);
      } else {
        this.loader.hide();
        console.log('ERROR IN BC', this.nftData.tokenID);
        this.toast.show('error', 'Failed to Transfer NFT', 'please try again with in some time.');
      }
    }


  }


  async checkCurrentFees() {
    const dialogRef = this.dialog.open(AvaliableBlockChainComponent, {
      disableClose: true,
      height: 'auto',
      width: '900px',
      panelClass: 'ListingPreview',
      data: {
        type: 'create',
      }
    });

    dialogRef.afterClosed().subscribe(async item => {
      console.log('response back from dialog checkCurrentFees', item);
      console.log({ item });
      if (item) {
        this.nftData.blockchain = item.selectedChain;
        this.nftData.ownerAddress = item.address;
        this.userPrivateKey = localStorage.getItem(`ssid-${this.common.selectedSSID}-privateKey`);
        if (!this.userPrivateKey) {
          $('#encryptPrivateKeys').modal('show');
          return;
        }
        await this.getEstimateFee();
        $('#estimateFeesModal').modal('show');
      }
    });
  }

  public async processNFTAndCreate() {

    try {
      this.loader.show();
      this.common.loaderText = 'Hashing NFT file..';
      const filePath = this.nftData.file.path;
      const hash: any = await this.networkService.hashFile(filePath);
      console.log(filePath);
      // console.table('this.nftData.file>>>>', this.nftData.file)
      this.nftData.SPORTALID = hash.hash;
      let thumbnail = '';
      if (this.nftData.coverImage) {
        this.common.loaderText = 'Uploading file to data center..';
        const form = new FormData();
        form.append('images', this.nftData.coverImage);
        if (!this.nftData.thumbnail) {
          const files: any = await this.networkService.uploadFile({ filePath, toSTORJ: false });
          console.log(files);
          if (files.stack) {
            this.loader.hide();
            this.toast.show('error', 'Failed to Create NFT', files.message);
            return;
          }
          thumbnail = files.thumbnailUrl;
          console.log(thumbnail);
          this.nftData.thumbnail = thumbnail;
        }
      }
      const storjForm = new FormData();
      storjForm.append('files', this.nftData.file);
      this.common.loaderText = 'uploading encrypted file';
      const key: any = await this.networkService.uploadFile({ filePath, toSTORJ: true });
      console.log(key);
      let storjKey = '';
      if (key.code === 1) {
        storjKey = key.files[0];
      }
      this.nftData.storjKey = storjKey;
      this.nftData.profileID = localStorage.getItem('profileID');
      this.nftData.unsignedData = {
        SPORTALID: this.nftData.SPORTALID,
        profileID: this.nftData.profileID
      };
      this.common.loaderText = 'Creating digital signature..';
      const digitalSignature: any = await this.networkService.signMessage(this.userPrivateKey, JSON.stringify(this.nftData.unsignedData));
      this.nftData.digitalSignature = digitalSignature.signature;
      this.common.loaderText = 'Creating IPFS..';

      const nftData = { ...this.nftData };
      delete nftData.coverImage;
      delete nftData.file;
      delete nftData.fileSrc;
      delete nftData.coverImageURL;
      delete nftData.edit;
      const IPFS: any = await this.api.apiProcess({ type: 'createIPFS', ...nftData }).toPromise();
      nftData.IPFSHash = IPFS.result.status.IPFS.IpfsHash;
      nftData.tokenURI = `https://gateway.pinata.cloud/ipfs/` + nftData.IPFSHash;
      this.common.loaderText = 'Signing the transaction...';
      const signature: any = await this.blockChain.signature(nftData.tokenURI, this.common.selectedWalletPrivateKey);

      console.log({ signature });

      if (!signature.tokenID) {
        this.loader.hide();
        this.toast.show('error', 'Failed to Create NFT', 'unable to Create TokenID');
        return;
      }

      //this.nftData.signedTx = signature.signedTx
      nftData.address = signature.address;
      nftData.tokenURI = signature.tokenURI;
      nftData.tokenID = signature.tokenID;
      nftData.blockchain = signature.blockchain;
      this.common.loaderText = 'Merging your Artwort,Minting your NFT it takes around a minute..';
      console.log({ nftData: this.nftData });

      if (this.nftData.storjKey) {
        const res: any = await this.api.apiProcess({
          type: 'createNFT',
          NFT: {
            ...nftData, ssid: this.common.selectedSSID,
            estimatedFees: this.feeDetails, tickerID: this.tickerID
          },
        }).toPromise();
        if (res.result.status.code === 1) {
          this.nftData = {};
          this.nftData = res.result.status.result.result;
          this.common.NFT = res.result.status.result.result;
          this.common.editNFT = false;
          this.toast.show('success', 'NFT Created Successfully', 'NFT Created Successfully');
          $('#estimateFeesModal').modal('hide');
          await this.getAllBridges();
          // this.backToCreate();
        } else {
          this.toast.show('error', 'Failed to Create NFT', 'please try again with in some time.');
          // SHow Error
        }
      }
      this.loader.hide();
    } catch (error) {
      console.log(error);
    }
  }

  backToCreate() {
    this.router.navigate(['/create-nft']);
  }

  async downloadStorj(filename) {
    console.log(filename);
    const storjRes = this.api.apiProcess({
      type: 'downloadStorj',
      key: filename
    }).subscribe(async (res: any) => {
      console.log('storjRes', res);
      this.storjData = res.result.status.result;
      await this.networkService.downloadFile(this.storjData, false);
      this.toast.show('success', 'Storj file downloaded', 'You file has been downloaded in the Downloads folder');
      // window.open(this.storjData, 'Download');
    });
  }

  closeTable() {
    $('.FixedPreviewTable').addClass('closeTable');
    $('body').addClass('RemoveCustom');
  }

  openResultPage(url: string) {
    window.open(url);
  }

  showCard() {

  }
  redirecttostorejk() {

  }
  certificate() {
    //open in Dialog from shared Module
    const dialogRef = this.dialog.open(CertificateNftComponent, {
      disableClose: true,
      height: '800px',
      width: '900px',
      panelClass: 'ListingPreview',
    });

    dialogRef.afterClosed().subscribe(item => {
      console.log('response back from dialog certificate', item);
      if (!item) { return; };

    });
    // this.router.navigate(['/nft/certificate']);
  }

  invoice() {
    //open in Dialogfrom shared module
    const dialogRef = this.dialog.open(InvoiceComponent, {
      disableClose: true,
      height: '800px',
      width: '900px',
      panelClass: 'ListingPreview',
    });

    dialogRef.afterClosed().subscribe(item => {
      console.log('response back from dialog invoice', item);
      if (!item) { return; };

    });
    // this.router.navigate(['/nft/invoice']);
  }

  goToBridgeNFT() {
    this.router.navigate(['/nft/bridge'], { state: { nftData: this.nftData } });
  }

  async openInBrowser(id, aloneUrl) {
    let link = id;
    if (!aloneUrl) {
      link = 'https://testnets.opensea.io/assets/0x39fDcb1dCf9bed318466bcaB515815182925B22D/' + id;
    }
    await this.networkService.openInBrowser({ link });
  }
  async openLinkInBrowser(link) {
    if (link === undefined || link === null) {
      link = 'https://explorer.theotherfruit.io/';
    }
    const res = await this.networkService.openInBrowser({ link });
  }

  async txID(id) {

    let link = id;
    const network = APP_CONFIG.network;

    if (this.nftData.blockchain === 'ETH') {
      link = ((network === 'main' ? 'https://etherscan.io/tx/' : 'https://rinkeby.etherscan.io/tx/') + id);
    }
    if (this.nftData.blockchain === 'AVA') {

      link = ((network === 'main' ? 'https://snowtrace.io/tx/' : 'https://testnet.avascan.info/blockchain/c/tx/') + id);
    }
    if (this.nftData.blockchain === 'BSC') {
      link = ((network === 'main' ? 'https://bscscan.com/tx/' : 'https://testnet.bscscan.com/tx/') + id);
    }
    if (this.nftData.blockchain === 'POLYGON') {
      link = ((network === 'main' ? 'https://polygonscan.com/tx/' : 'https://mumbai.polygonscan.com/tx/') + id);
    }
    if (this.nftData.blockchain === 'KLAYTN') {
      link = ((network === 'main' ? 'https://scope.klaytn.com/tx/' : 'https://baobab.scope.klaytn.com/tx/') + id);
    }
    await this.networkService.openInBrowser({ link });
  }

  async openSeaLink(id, blockchainType?) {
    console.log(id, blockchainType);
    if (blockchainType === 'ETH') {
      await this.networkService.openInBrowser(
        { link: 'https://testnets.opensea.io/assets/0x39fDcb1dCf9bed318466bcaB515815182925B22D/' + id });
    }
  }

  async openExplorer(data) {
    if (data.txid) {
      await this.networkService.openInBrowser({ link: 'https://explorer.theotherfruit.io/chain/transaction/' + data.txid });
    }
  }

  async checkForKey(data?) {
  }

  async refreshMetaData() {
    this.loader.show();
    this.common.loaderText = 'Fetching Metadata ..';
    const res: any = await this.api.apiProcess({
      type: 'refreshMetaData',
      tokenId: this.nftData.tokenID,
      blockchain: this.nftData.blockchain,
      contractAddress: this.nftData.contractAddress,
      NFTID: this.nftData.NFTID,
    }).toPromise();
    this.loader.hide();
    if (res.result.status.code) {
      this.nftData = res.result.status.data;
      this.common.NFT = res.result.status.data;
      // this.getAvailableWallets(this.common.NFT.blockchain, this.selectedChain);
      this.common.editNFT = false;
      this.toast.show('success', res.result.status.message || 'NFT Metadata Refreshed Successfully', 'NFT Metadata Refreshed Successfully');
    } else {

    }
    console.log('my ssid Data', res);

    this.allSsidList = res.result.status.data;
  }




  async getBlockChainData() {
    this.avalaibleBlockChainData = [];
    const id = this.common.selectedSSID || this.nftData.ssid;
    this.common.blockChainData.map(async data => {
      const keyName = data.value + 'PrivateKey' + id;
      data.selected = false;
      const obj = await localStorage.getItem(keyName);
      if (obj) {
        data.keys = JSON.parse(obj);
        this.avalaibleBlockChainData.push(data);
      }
      if (this.avalaibleBlockChainData.length >= 1) { this.showWalletBtn = false; } else { this.showWalletBtn = true; }
    });
  }

  async mapCall() {
    console.log('Ready to show MAP', this.nftData);

    const latlng = await new google.maps.LatLng(this.nftData.latitude, this.nftData.longitude); //Set the default location of map
    console.log(latlng);

    const map = new google.maps.Map(document.getElementById('mapPreview'), {
      draggable: false, zoomControl: false,
      scrollwheel: false, disableDoubleClickZoom: true, gestureHandling: 'greedy', disableDefaultUI: true,
      zoom: 15, center: latlng, styles: [
        {
          elementType: 'geometry',
          stylers: [
            {
              color: '#212121'
            }
          ]
        },
        {
          elementType: 'labels.icon',
          stylers: [
            {
              visibility: 'off'
            }
          ]
        },
        {
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#757575'
            }
          ]
        },
        {
          elementType: 'labels.text.stroke',
          stylers: [
            {
              color: '#212121'
            }
          ]
        },
        {
          featureType: 'administrative',
          elementType: 'geometry',
          stylers: [
            {
              color: '#757575'
            },
            {
              visibility: 'off'
            }
          ]
        },
        {
          featureType: 'administrative.country',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#9e9e9e'
            }
          ]
        },
        {
          featureType: 'administrative.land_parcel',
          stylers: [
            {
              visibility: 'off'
            }
          ]
        },
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#bdbdbd'
            }
          ]
        },
        {
          featureType: 'administrative.neighborhood',
          stylers: [
            {
              visibility: 'off'
            }
          ]
        },
        {
          featureType: 'poi',
          stylers: [
            {
              visibility: 'off'
            }
          ]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#757575'
            }
          ]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [
            {
              color: '#181818'
            }
          ]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#616161'
            }
          ]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.stroke',
          stylers: [
            {
              color: '#1b1b1b'
            }
          ]
        },
        {
          featureType: 'road',
          elementType: 'geometry.fill',
          stylers: [
            {
              color: '#2c2c2c'
            }
          ]
        },
        {
          featureType: 'road',
          elementType: 'labels',
          stylers: [
            {
              visibility: 'off'
            }
          ]
        },
        {
          featureType: 'road',
          elementType: 'labels.icon',
          stylers: [
            {
              visibility: 'off'
            }
          ]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#8a8a8a'
            }
          ]
        },
        {
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [
            {
              color: '#373737'
            }
          ]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [
            {
              color: '#3c3c3c'
            }
          ]
        },
        {
          featureType: 'road.highway.controlled_access',
          elementType: 'geometry',
          stylers: [
            {
              color: '#4e4e4e'
            }
          ]
        },
        {
          featureType: 'road.local',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#616161'
            }
          ]
        },
        {
          featureType: 'transit',
          stylers: [
            {
              visibility: 'off'
            }
          ]
        },
        {
          featureType: 'transit',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#757575'
            }
          ]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [
            {
              color: '#000000'
            }
          ]
        },
        {
          featureType: 'water',
          elementType: 'labels.text',
          stylers: [
            {
              visibility: 'off'
            }
          ]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#3d3d3d'
            }
          ]
        }
      ]
    });
    console.log(map);

    const marker = new google.maps.Marker({
      position: latlng,
      map,
      title: 'testing', //The title on hover to display
      draggable: false, //this makes it drag and drop
      icon: 'assets/images/listing_location_marker.png'
    });
  }

  reduceCount() {
    if (this.feeEstimateTimerCount <= 0) {
      this.waitBeforeSendingAgain = false;
      if (this.feesEstimateInterval) {
        clearInterval(this.feesEstimateInterval);
      }
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

  ngOnDestroy() {
    if (this.feesEstimateInterval) {
      clearInterval(this.feesEstimateInterval);
    }
  }

  goToSelectedSSID(ssid) {
    this.router.navigate(['/ssid/create'], { state: { newSSID: false, ssid } });
  }

  copyAdvanceNFTDetails() {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = 'Key :- ' + this.nftData.storjKey + '\n' + 'AERIE® ID :- ' + this.nftData.SPORTALID + '\n' + 'IPFSHASH :- ' + this.nftData.IPFSHash + '\n' + 'ProfileID :- ' + this.nftData.profileID + '\n' + 'Client ID :- ' + this.nftData.ssid + '\n' + 'Client Name :- ' + this.nftData.ssidName;
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand('copy');
      this.toast.show('success', 'Copied to clipboard', '');
      this.copyText = 'Copied to clipboard!!';
      setTimeout(
        function() {
          this.copyText = 'click to copy';
        }, 3000);
      document.body.removeChild(textArea);
    } catch (err) {
      this.toast.show('error', 'Failed to Copy', '');
      console.log('Oops, unable to copy');
    }
  }

  copyNFTDetails() {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = 'Result Page :- ' + this.nftData.personalizedEndpoint + '\n' + 'TXID :- ' +
        this.nftData.txid + '\n' + 'TOKEN ID :- ' + this.nftData.tokenID + '\n' +
        'Blockchain :- ' + this.nftData.blockchain + '\n' + 'File Size :- ' + this.nftData.fileSize + '\n' +
        'Country :- ' + this.nftData.country + '\n' + 'Owner Address :- ' + this.nftData.ownerAddress;
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand('copy');
      this.toast.show('success', 'Copied to clipboard', '');
      this.copyText = 'Copied to clipboard!!';
      setTimeout(
        function() {
          this.copyText = 'click to copy';
        }, 3000);
      document.body.removeChild(textArea);

    } catch (err) {
      this.toast.show('error', 'Failed to Copy', '');
      console.log('Oops, unable to copy');
    }
  }


}
