import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ipcRenderer } from 'electron';
import { ApiService } from '../../../services/apiServices/api.service';
import { BlockChainService } from '../../../services/blockChain/block-chain.service';
import { CommonService } from '../../../services/common/common.service';
import { HashFileService } from '../../../services/fs/hash-file.service';
import { IntercomService } from '../../../services/intercom/intercom.service';
import { NetworkService } from '../../../services/network/network.service';
import { SpinnerService } from '../../../services/spinner/spinner.service';
import { ToastrServiceService } from '../../../services/toastr/toastr-service.service';
import { AvaliableSSIDComponent } from '../../../shared/components/avaliable-ssid/avaliable-ssid.component';
declare let $: any;

@Component({
  selector: 'app-import-nft',
  templateUrl: './import-nft.component.html',
  styleUrls: ['./import-nft.component.scss']
})
export class ImportNFTComponent implements OnInit, OnDestroy {

  public avalaibleBlockChainData: any = [];
  public selectedWalletPrivateKey: any;
  public selectedChain: any;
  public showScreen = 1;
  public myProfileID = localStorage.getItem('profileID');
  public selectedSSID = null;
  public selectedWalletAddress: string;
  public allNFTList = [];
  public allSsidList = [];
  public feeDetails: any;
  public balance: any;
  public currentblockchain: any;
  public showSelectMultiKeyError = false;
  public selectedNFTS: any = [];
  public nftSelected: boolean;
  public showSignError = false;
  public showSelectSSIDError = false;
  public selectedSSIDName: string;
  public newBlockchain: string;
  public importToWalletAddress: string;
  public feeEstimateTimerCount = 0;
  public waitBeforeSendingAgain = false;
  public showWalletBtn = false;
  public feesEstimateInterval;
  public tickerID;
  public contractAddressForm: FormGroup;
  public emptyNftsArray;
  public loadingNFTS = false;
  public URL = 'https://images-na.ssl-images-amazon.com/images/I/91MteSqsrJL.jpg';

  constructor(
    private api: ApiService,
    private router: Router,
    public common: CommonService,
    public fileHash: HashFileService,
    private formBuilder: FormBuilder,
    private loader: SpinnerService,
    private toast: ToastrServiceService,
    private blockchain: BlockChainService,
    private icom: IntercomService,
    private networkService: NetworkService,
    public dialog: MatDialog
  ) {
    {
      if (this.router.getCurrentNavigation()) {
        if (this.router.getCurrentNavigation().extras.state) {
          this.selectedSSID = this.router.getCurrentNavigation().extras.state.ssid;
        }
      }
    }
  }



  async ngOnInit() {
    this.common.ssidObject = {};
    this.common.selectedWalletPrivateKey = null;
    this.emptyNftsArray = false;
    this.contractAddressForm = this.formBuilder.group({
      contractAddress: ['', [Validators.required, Validators.minLength(21)]],
    });
    // if (!this.common.selectedSSID) {
    this.common.openSSIDDialog();
    // }
  }

  async checkForApproval() {
    console.log(this.selectedNFTS[0].token_id);
    // $('#showNetwork').modal('show');
    const resp: any = await this.api.apiProcess({
      type: 'getRecentRequestByAssetID',
      // assetID: '123'
      assetID: this.selectedNFTS[0].token_id
    }).toPromise();
    const latestRequest = resp.result.status.data;

    if (!latestRequest[0]) {
      // raise Ticket Modal
      $('#showRaiseTicketModal').modal('show');
    }
    else {
      if (latestRequest[0].status === 'APPROVED') {
        this.toast.show('success', 'Request is Approved for this Asset ID',
          'Select Network to complete further step..');
        $('#showNetwork').modal('show');
        return;
      }
      else if (latestRequest[0].status === 'REJECTED') {
        this.toast.show('error', 'last Request for this Asset was Rejected',
          'Raise a new Request to import this NFT..');
        $('#showRaiseTicketModal').modal('show');
        // $('#showNetwork').modal('show');
        return;
      } else {
        this.toast.show('warning', 'voting is not yet Completed for this NFT Request',
          'Please wait for it to Complete..');
      }
    }


  }


  async getEstimateFee() {
    this.common.loaderText = 'fetching selected wallet balance and estimated fees to Import...  ';
    this.loader.show();
    const result: any = await this.api.apiProcess({
      type: 'feeEstimate',
      blockchain: this.selectedChain,
      address: this.selectedWalletAddress,
      toBlockchain: this.newBlockchain,
      action: 'import',
      tofID: '123',
      tofType: 'import'
    }).toPromise();
    this.loader.hide();
    this.common.loaderText = 'fetching data...  ';
    this.feeDetails = result.result.status.result;
    this.tickerID = this.feeDetails.estimate.id;
    this.feesEstimateRetry();
  }

  humanFileSize(bytes, si = false, dp = 1) {
    const thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }
    const units = si
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;
    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
    return bytes.toFixed(dp) + ' ' + units[u];
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchNFT() {
    this.loader.show();
    this.loadingNFTS = true;
    this.emptyNftsArray = true;
    this.common.loaderText = 'Fetching NFTS from selected wallet..';
    if (this.common.selectedWalletAddress) {
      this.allNFTList = [];
      this.common.unsecureImportList = [];
      this.common.securedImportList = [];
      const resp: any = await this.api.apiProcess({
        type: 'getNFTSWithWalletAddress',
        // address: '0x7f9517162Af558183d54E1Be61eBdd079B065f13'
        address: this.common.selectedWalletAddress,
        blockchain: this.common.selectedChain,
        contractAddress: this.contractAddressForm.controls.contractAddress.value,
      }).toPromise();
      this.loader.hide();
      console.log(resp.result.status);
      if (resp.result.status.code) {
        this.loader.hide();
        this.emptyNftsArray = true;
      } else if (!resp.result.status.code && resp.result.status.length >= 1) {
        this.allNFTList = resp.result.status;
        this.loader.hide();
        this.common.loaderText = 'Loading...';
        this.loadingNFTS = false;
        this.common.unsecureImportList = [];
        this.common.securedImportList = [];
        this.allNFTList.map(nft => {
          if (nft.symbol !== 'RWSCT') {
            this.common.unsecureImportList.push(nft);
          } else {
            this.common.securedImportList.push(nft);
          }
        });
        this.router.navigate(['/import-nft/list']);
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        // for (let index = 0; index < this.allNFTList.length; index++) {
        //   if (!this.allNFTList[index].imageUrl) {
        //     await this.delay(1000);
        //     const temp: any = await this.networkService.getNFTMetadata(this.allNFTList[index].token_uri);
        //     this.allNFTList[index].imageUrl = temp.image;
        //   }
        // }

      } else if (resp.result.status.length >= 1) {
        this.emptyNftsArray = true;
        this.allNFTList = [];
        this.loadingNFTS = false;
        this.allNFTList = [];

      }
    } else {
      this.loader.hide();
      this.common.loaderText = 'Loading...';
    }
  }

  getNFTMetadata(uri) {
    return this.api.getNFTMetadata(uri).toPromise();
  }

  getSelectedNFT(index) {
    if (this.allNFTList[index].symbol !== 'RWSCT') {
      this.selectedNFTS.forEach(sel => {
        this.allNFTList = this.allNFTList.map(all => {
          if (sel.token_id === all.token_id) {
            all.selected = !all.selected;
          }
          return all;
        });
      });
      this.allNFTList[index].selected = !this.allNFTList[index].selected;
    } else {
      this.toast.show('warning', 'You cannot select already Secured NFT', '');
    }
    this.selectedNFTS = this.allNFTList.filter(((nft) => nft.selected === true));
  }

  selectWallet(item, chain) {
    console.log(item, chain);
    this.selectedWalletAddress = item.address;
    this.common.selectedWalletAddress = item.address;
    this.common.selectedWalletPrivateKey = item.key;
    this.selectedWalletPrivateKey = item.key;
    this.selectedChain = chain;
    this.common.selectedWalletType = chain;
    this.common.selectedChain = chain;
    this.showSelectMultiKeyError = false;
  }

  async checkForKey(key) {
    console.log(key);
    $('.nft_radioItem').removeClass('active');
    //document.getElementById('parent'+key).classList.add('active')
  }

  async importNFT() {
    console.log(this.selectedNFTS);

    this.selectedNFTS.map(async (nft) => {
      await this.processNFT(nft);
    });
  }

  async signMessage(pvkey, challenge) {
    return new Promise(async (resolve, reject) => {
      const respEvent = await this.icom.processIPC(
        'SSID', 'signMessage', { challenge, pvkey });
      console.log({ respEvent });

      ipcRenderer.once(respEvent, (ev, arg) => {
        console.log(arg, ev);
        resolve(arg.result);
      });
    });
  }

  async deletingFunction() {
    console.log({ ownerAddress: this.selectedWalletAddress });
    const url = '';
    const d: any = await this.networkService.getNFTMetadata(url);
    console.log({ d });
    // const storeToLocal = await this.
    const imageResult: any = await this.networkService.downloadFileInAppDirectory({ url: d.image, name: d.name });
    if (!imageResult.result.code) {
      throw new Error('Download Failed');
    }
    const localFilePath = imageResult.result.data.path;
    console.log({ imageResult });
  }

  async processNFT(item) {
    if (this.newBlockchain && this.importToWalletAddress) {
      this.loader.show();
      this.common.loaderText = 'Importing your NFT..';
      console.log({ ownerAddress: this.selectedWalletAddress });

      const d: any = await this.networkService.getNFTMetadata(item.token_uri);
      console.log({ d });
      // const storeToLocal = await this.
      const imageResult: any = await this.networkService.downloadFileInAppDirectory({ url: d.image, name: d.name });
      if (!imageResult.result.code) {
        throw new Error('Download Failed');
      }
      const localFilePath = imageResult.result.data.path;
      console.log({ imageResult });
      const deletResult: any = await this.networkService.deletFileInAppDirectory({ name: localFilePath });
      const fileSize = this.humanFileSize(imageResult.result.data.fileSize);
      const nft: any = { ...item, fileSize };

      // this.loader.show();
      this.common.loaderText = 'Hashing NFT file..';
      const hash: any = await this.networkService.hashFile(localFilePath);
      // console.log(hash);
      nft.SPORTALID = hash.hash;
      let thumbnail = '';
      // if (this.NFT.coverImage) {
      //this.loader.showLoader('Optimizing Cover....', 'NFTOC');
      this.common.loaderText = 'Uploading to data center..';
      const form = new FormData();
      form.append('images', nft.file);
      if (!nft.thumbnail) {
        const files: any = await this.networkService.uploadFile({ filePath: localFilePath, toSTORJ: false });
        if (files.stack) {
          this.loader.hide();
          this.toast.show('error', 'Failed to Create NFT', files.message);
        }
        thumbnail = files.thumbnailUrl;
        nft.thumbnail = thumbnail;
      }
      this.common.loaderText = 'uploading encrypted file';
      // this.loader.hideLoader('NFTNFTOC');
      // }
      const storjForm = new FormData();
      storjForm.append('files', nft.file);
      const key: any = await this.networkService.uploadFile({ filePath: localFilePath, toSTORJ: true });
      console.log(key);
      let storjKey = '';
      if (key.code === 1) {
        storjKey = key.files[0];
      }
      nft.storjKey = storjKey;
      delete nft.coverImage;
      delete nft.file;
      delete nft.fileSrc;
      delete nft.coverImageURL;
      nft.profileID = localStorage.getItem('profileID');
      nft.unsignedData = {
        SPORTALID: nft.SPORTALID,
        profileID: nft.profileID
      };
      this.common.loaderText = 'Creating digital signature..';
      const digitalSignature: any = await this.signMessage(this.common.userPrivateKey, JSON.stringify(nft.unsignedData));
      nft.digitalSignature = digitalSignature.signature;
      console.log({ nft });
      this.common.loaderText = 'Creating IPFS..';
      const IPFS: any = await this.api.apiProcess({ type: 'createIPFS', ...nft }).toPromise();
      console.log({ IPFS });
      console.log({ NFT: nft });


      nft.IPFSHash = IPFS.result.status.IPFS.IpfsHash;
      nft.tokenURI = `https://gateway.pinata.cloud/ipfs/` + nft.IPFSHash;
      nft.address = this.importToWalletAddress;
      nft.tokenID = nft.token_id;
      nft.blockchain = this.newBlockchain;
      this.common.loaderText = 'Signing the transaction...';

      console.log(String(nft.tokenID.toLocaleString('fullwide', { useGrouping: false })),
        nft.token_address, this.selectedWalletPrivateKey, nft.contract_type, this.feeDetails, this.selectedChain
      );

      const stakedObject = await this.blockchain.importNFT(
        String(nft.tokenID.toLocaleString('fullwide', { useGrouping: false })),
        nft.token_address, this.selectedWalletPrivateKey, nft.contract_type, this.feeDetails, this.selectedChain);

      console.log({ type: 'importNFT', NFT: nft, stakedObject });

      if (stakedObject) {
        this.common.loaderText = 'NFT staked successfully, importing your NFT..';
        const res: any = await this.api.apiProcess({
          type: 'importNFT', NFT:
          {
            ...nft, ssid: this.selectedSSID,
            ssidName: this.common.ssidObject.name, stakedObject, ownerAddress: this.importToWalletAddress,
            estimatedFees: this.feeDetails,
            tickerID: this.tickerID
          }
        }).toPromise();
        this.loader.hide();
        if (res.result.status.code === 1) {
          this.toast.show('success', 'NFT Imported Sucessfully', 'NFT Imported Sucessfully');
          this.common.NFT = res.result.status.result;
          $('#showNetwork').modal('hide');
          this.router.navigate(['/nft/preview']);
          console.log(res);
          // this.loader.hide();
        } else {
          this.toast.show('error', res.result.status.error || 'Failed to Stake NFT', 'please try again with in some time.');

        }
      }
      else {
        this.loader.hide();
        this.toast.show('error', 'Failed to Stake NFT', 'please try again with in some time.');
      }
    }
  }

  modalCheckForKey(data?) {
    console.log(data);
  }

  modalSelectWallets(item, chain) {
    console.log(item, chain);
    this.importToWalletAddress = item.address ? item.address : item.key;
    // this.common.selectedWalletPrivateKey = item.key;
    // this.importToWalletPrivateKey = item.key;
    this.newBlockchain = chain;
    // this.common.selectedWalletType = chain;
    // this.common.selectedChain = chain;
    // this.showSelectMultiKeyError = false;

  }

  reduceCount() {
    if (this.feeEstimateTimerCount <= 0) {
      this.waitBeforeSendingAgain = false;
    } else {
      this.feeEstimateTimerCount--;
    }
  }

  async fundWallet() {
    this.common.loaderText = 'Funding the wallet, it will take a around a minute to complete...  ';

    this.loader.show();

    const result: any = await this.api.apiProcess({
      type: 'fundWallet',
      blockchain: this.newBlockchain,
      to: this.selectedWalletAddress,
      value: this.feeDetails.differenceInCrypto,
      estimatedFees: this.feeDetails,
      ssid: this.common.ssidObject.ssid,
      ssidName: this.common.ssidObject.name
    }).toPromise();

    this.loader.hide();
    this.common.loaderText = 'fetching data...  ';
    if (result.result.status.code) {
      this.toast.show('success', 'Wallet Funded Sucessfully', 'Wallet Funded Sucessfully');
      this.getEstimateFee();
    }
  }

  feesEstimateRetry() {
    const reset = 30;
    this.feeEstimateTimerCount = reset;
    console.log(this.feeEstimateTimerCount);
    this.waitBeforeSendingAgain = true;
    if (this.feesEstimateInterval) {
      clearInterval(this.feesEstimateInterval);
    }
    this.feesEstimateInterval = setInterval(() => { this.reduceCount(); }, 1000);
  }

  ngOnDestroy() {
    if (this.feesEstimateInterval) {
      clearInterval(this.feesEstimateInterval);
    }
  }
}

