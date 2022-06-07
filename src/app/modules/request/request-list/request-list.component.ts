/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../services/apiServices/api.service';
import { CommonService } from '../../../services/common/common.service';
import { SpinnerService } from '../../../services/spinner/spinner.service';
import { ToastrServiceService } from '../../../services/toastr/toastr-service.service';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { BlockChainService } from '../../../services/blockChain/block-chain.service';
import { NetworkService } from '../../../services/network/network.service';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AvaliableBlockChainComponent } from '../../../shared/components/avaliable-block-chain/avaliable-block-chain.component';

declare let $: any;
@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.scss']
})
export class RequestListComponent implements OnInit, OnDestroy {
  requestForm: FormGroup;
  requestList;
  totalCount;
  approvedCount;
  rejectCount;
  newCount;
  newArray;
  featchingRequests = false;
  public feeEstimateTimerCount = 0;
  public waitBeforeSendingAgain = false;
  public feesEstimateInterval;
  public tickerID;
  public avalaibleBlockChainData: any = [];
  public feeDetails: any;
  public selectedRequestData;
  public myProfileID = localStorage.getItem('profileID');
  constructor(
    private api: ApiService,
    public common: CommonService,
    private spinner: SpinnerService,
    private loader: SpinnerService,
    private toast: ToastrServiceService,
    private formBuilder: FormBuilder,
    private router: Router,
    private networkService: NetworkService,
    private cdr: ChangeDetectorRef,
    private blockchain: BlockChainService,
    public dialogRefActivate: MatDialogRef<AvaliableBlockChainComponent>,
  ) { }

  ngOnInit() {

    this.requestForm = this.formBuilder.group({
      remarks: ['', [Validators.required, Validators.minLength(5)]],
    });
    console.log(this.common.blockChainData);

    this.getNftRequestByProfileID();
  }

  async getEstimateFee() {
    this.common.loaderText = 'fetching selected wallet balance and estimated fees to Import...  ';
    this.loader.show();
    const result: any = await this.api.apiProcess({
      type: 'feeEstimate',
      blockchain: this.selectedRequestData.blockchain,
      address: this.selectedRequestData.ownerAddress,
      toBlockchain: this.common.selectedChain,
      action: 'import',
      tofID: this.selectedRequestData.assetID,
      tofType: 'import'
    }).toPromise();
    this.loader.hide();
    this.common.loaderText = 'fetching data...  ';
    this.feeDetails = result.result.status.result;
    this.tickerID = this.feeDetails.estimate.id;
    this.feesEstimateRetry();
  }

  async updateWhiteList(selectedRequestData) {
    console.log(selectedRequestData);
    const { requestID, assetDetails } = selectedRequestData;
    this.spinner.show();
    this.common.loaderText = 'Signing the Transaction,it will take a moment...';

    try {
      let transactionHash = null;

      const myMultiSigObject = await localStorage.getItem('multiSigKey-' + this.myProfileID);
      console.log({ myMultiSigObject });

      const bcResult: any = await this.blockchain.updateWhiteListingAddresses(
        selectedRequestData.assetDetails, selectedRequestData.ssid, JSON.parse(myMultiSigObject).key);
      console.log({ bcResult });

      if (bcResult.error) {
        this.spinner.hide();
        this.toast.show('error', bcResult.error.message || 'Failed to Approve Request', bcResult.error.message);
        return;
      }
      transactionHash = bcResult.transactionHash;


      const resp: any = await this.api.apiProcess({
        type: 'updateWhiteListedAddressesInRequest', requestID, transactionHash, assetDetails
      }).toPromise();
      this.spinner.hide();
      this.common.loaderText = 'Loading...';
      if (resp.result.status.code) {
        this.toast.show('success', 'White Listed Successfully',
          'WhiteListed Successfully..');
          $('#myModalRequestDetail').modal('hide');
          this.router.navigate(['/ssid/list']);
      } else {
        this.toast.show('error', resp.result.status.error || 'Failed to Vote', 'please try again with in some time.');
      }

    } catch (error) {
      console.log({ error });
      this.spinner.hide();
      this.toast.show('error', error.code, 'Please try again in some time...');
      return;
    }
  }

  async importNFT(item) {
    console.log(this.common.selectedChain, this.common.selectedWalletAddress, item);

    try {
      if (this.common.selectedChain && this.common.selectedWalletAddress) {

        let selectedWalletPrivateKey = null;
        console.log(this.common.blockChainData, this.selectedRequestData.ownerAddress);

        const currentNFTBlockchainWallets = JSON.parse(localStorage.getItem(
          `${this.selectedRequestData.blockchain}PrivateKey${this.selectedRequestData.ssid}`));
        console.log({ currentNFTBlockchainWallets });


        currentNFTBlockchainWallets.forEach(keys => {
          if (keys.address === this.selectedRequestData.ownerAddress) {
            selectedWalletPrivateKey = keys.key;
          }
        });

        console.log({ selectedWalletPrivateKey });

        if (!selectedWalletPrivateKey) {
          this.loader.hide();
          this.toast.show('error', 'unable to find private Key of Owner Address', 'please import the key file again');
          return;
        }

        const userPrivateKey = localStorage.getItem(`ssid-${this.selectedRequestData.ssid}-privateKey`);
        if (!userPrivateKey) {
          this.toast.show('error', 'Failed to get Private key for selected Client', 'please logout and upload your key file again.');
          return;
        }

        this.loader.show();
        this.common.loaderText = 'Fetching Asset Metadata..';

        const d: any = await this.networkService.getNFTMetadata(item.token_uri);
        console.log({ d });

        if (!d.image || !d.name) {
          this.loader.hide();
          this.toast.show('error', 'Failed to fetch Metadata', 'please try again in some time');
        }
        this.common.loaderText = 'dowloading file locally temporarily..';
        const imageResult: any = await this.networkService.downloadFileInAppDirectory({ url: d.image, name: d.name });
        console.log({ imageResult });
        if (!imageResult.result.code) {
          this.loader.hide();
          this.toast.show('error', 'Failed to Download real Image', '');
        }
        const localFilePath = imageResult.result.data.path;
        // const deletResult: any = await this.networkService.deletFileInAppDirectory({ name: localFilePath });
        const fileSize = this.common.humanFileSize(imageResult.result.data.fileSize);
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
            this.toast.show('error', 'Failed to upload NFT', files.message);
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
        const digitalSignature: any = await this.networkService.signMessage(userPrivateKey, JSON.stringify(nft.unsignedData));
        nft.digitalSignature = digitalSignature.signature;
        console.log({ nft });
        this.common.loaderText = 'Creating IPFS..';
        const IPFS: any = await this.api.apiProcess({ type: 'createIPFS', ...nft }).toPromise();
        console.log({ IPFS });
        console.log({ NFT: nft });


        nft.IPFSHash = IPFS.result.status.IPFS.IpfsHash;
        nft.tokenURI = `https://gateway.pinata.cloud/ipfs/` + nft.IPFSHash;
        nft.address = this.common.selectedWalletAddress;
        nft.tokenID = nft.token_id;
        nft.blockchain = this.common.selectedChain;
        this.common.loaderText = 'Signing the transaction...';

        const stakedObject = await this.blockchain.importNFT(
          String(nft.tokenID.toLocaleString('fullwide', { useGrouping: false })),
          nft.token_address, selectedWalletPrivateKey, nft.contract_type, this.feeDetails, this.selectedRequestData.blockchain);

        console.log({ type: 'importNFT', NFT: nft, stakedObject });

        if (stakedObject) {
          this.common.loaderText = 'NFT staked successfully, importing your NFT..';
          const res: any = await this.api.apiProcess({
            type: 'importNFT', NFT:
            {
              ...nft, ssid: this.selectedRequestData.ssid,
              ssidName: this.selectedRequestData.ssidName, stakedObject, ownerAddress: this.common.selectedWalletAddress,
              estimatedFees: this.feeDetails,
              tickerID: this.tickerID,
              requestID: this.selectedRequestData.requestID
            }
          }).toPromise();
          this.loader.hide();
          if (res.result.status.code === 1) {
            this.toast.show('success', 'NFT Imported Sucessfully', 'NFT Imported Sucessfully');
            this.common.NFT = res.result.status.result;
            $('#showNetwork').modal('hide');
            $('#myModalRequestDetail').modal('hide');
            this.router.navigate(['/create-nft/previewNFT']);
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
    } catch (error) {

      this.loader.hide();
      this.toast.show('error', 'Failed to import NFT', 'please try again with in some time.');

    }

  }


  public async deleteRequest(requestID, index) {
    // const resp: any = await this.api.apiProcess({
    //   type: 'deleteRequest', requestID,
    // }).toPromise();
    // this.spinner.hide();
    // this.common.loaderText = 'Loading...';
    // if (resp.result.status.code) {
    //   this.toast.show('success', 'Voted Successfully',
    //     'Voted Successfully..');
    //   this.requestList.splice(index, 1);
    // } else {
    //   this.toast.show('error', resp.result.status.error || 'Failed to Vote', 'please try again with in some time.');
    // }
  }

  public checkIfVoted(voteDetails) {
    return voteDetails.some(elem => elem.profileID === this.myProfileID);
  }

  async getNftRequestByProfileID(page?) {
    this.spinner.show();
    this.featchingRequests = true;
    this.common.loaderText = 'Fetching all NFT Requests...';
    const result: any = await this.api.apiProcess({
      type: 'getNftRequestByProfileID',
      page
    }).toPromise();
    this.featchingRequests = false;
    this.requestList = result.result.status.data;
    this.newArray = this.requestList;
    this.totalCount = this.requestList.length;
    this.approvedCount = this.requestList.filter((req) =>
      (req.status.includes('APPROVED'))).length + this.requestList.filter((req) => (req.status.includes('IMPORTED'))).length;
    this.rejectCount = this.requestList.filter((req) => (req.status.includes('REJECTED'))).length;
    this.newCount = this.requestList.filter((req) => (req.status.includes('NEW'))).length;
    this.spinner.hide();
    this.common.loaderText = 'Loading...';
    console.log(this.requestList);
  }

  async filterApproved() {
    this.spinner.show();
    this.common.loaderText = 'Fetching Approved NFTs...';
    this.newArray = this.requestList?.filter(req => (req.status === 'APPROVED' || req.status === 'IMPORTED'));
    this.cdr.detectChanges();
    this.spinner.hide();
    this.common.loaderText = 'Loading...';
  }

  async filterRejected() {
    this.spinner.show();
    this.common.loaderText = 'Fetching Rejected NFTs...';
    this.newArray = this.requestList?.filter(req => req.status === 'REJECTED');
    this.cdr.detectChanges();
    this.spinner.hide();
    this.common.loaderText = 'Loading...';
  }

  async filterNew() {
    this.spinner.show();
    this.common.loaderText = 'Fetching New NFTs...';
    this.newArray = this.requestList?.filter(req => req.status === 'NEW');
    this.cdr.detectChanges();
    this.spinner.hide();
    this.common.loaderText = 'Loading...';
  }

  public selectRequest(req) {
    console.log(req);
    this.selectedRequestData = req;
    $('#myModalRequestDetail').modal('show');
    this.cdr.detectChanges();
  }

  async peformAction(requestID, vote, index) {
    this.spinner.show();
    this.common.loaderText = 'Signing the Transaction,it will take a moment...';

    try {
      let transactionHash = null;
      if (vote === 'APPROVED') {
        console.log(this.myProfileID, 'multiSigKey-' + this.myProfileID);

        const myMultiSigObject = await localStorage.getItem('multiSigKey-' + this.myProfileID);
        console.log({ myMultiSigObject });

        const bcResult: any = await this.blockchain.signTicket(JSON.parse(myMultiSigObject).key, this.newArray[index].txnNonce);
        if (bcResult.error) {
          this.spinner.hide();
          this.toast.show('error', bcResult.error.message || 'Failed to Approve Request', bcResult.error.message);
          return;
        }
        transactionHash = bcResult.transactionHash;
      }

      const resp: any = await this.api.apiProcess({
        type: 'voteInRequest', requestID, vote, transactionHash
      }).toPromise();
      this.spinner.hide();
      this.common.loaderText = 'Loading...';
      if (resp.result.status.code) {
        this.toast.show('success', 'Voted Successfully',
          'Voted Successfully..');
        this.requestList[index] = resp.result.status.data;
      } else {
        this.toast.show('error', resp.result.status.error || 'Failed to Vote', 'please try again with in some time.');
      }

    } catch (error) {
      console.log({ error });
      this.spinner.hide();
      this.toast.show('error', error.code, 'Please try again in some time...');
      return;
    }
  }

  async fundWallet() {
    this.common.loaderText = 'Funding the wallet, it will take a around a minute to complete...  ';

    this.loader.show();

    const result: any = await this.api.apiProcess({
      type: 'fundWallet',
      blockchain: this.selectedRequestData.blockchain,
      to: this.selectedRequestData.ownerAddress,
      value: this.feeDetails.differenceInCrypto,
      estimatedFees: this.feeDetails,
      ssid: this.common.ssidObject.ssid,
      ssidName: this.common.ssidObject.name
    }).toPromise();

    this.loader.hide();
    this.common.loaderText = 'fetching data...  ';
    if (result.result.status.code) {
      this.toast.show('success', 'Wallet Funded Sucessfully,refreshing estimates in 30 seconds', 'Wallet Funded Sucessfully');
      this.getEstimateFee();
    }
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

  closeDialog() {
    this.dialogRefActivate.close(true);
  }

}
