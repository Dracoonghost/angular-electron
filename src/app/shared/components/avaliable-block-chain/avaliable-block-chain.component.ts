import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BlockChainService } from '../../../services/blockChain/block-chain.service';
import { CommonService } from '../../../services/common/common.service';
import { SpinnerService } from '../../../services/spinner/spinner.service';
import { ToastrServiceService } from '../../../services/toastr/toastr-service.service';
import { MatDialogRef } from '@angular/material/dialog';
import { NetworkService } from '../../../services/network/network.service';
import { Inject } from '@angular/core';
declare let $: any;


@Component({
  selector: 'app-avaliable-block-chain',
  templateUrl: './avaliable-block-chain.component.html',
  styleUrls: ['./avaliable-block-chain.component.scss']
})
export class AvaliableBlockChainComponent implements OnInit {

  @Input() isModal = true;
  @Input() title = 'select Your Wallet';
  avalaibleBlockChainData: any = [];
  public previewData: any = [];
  public blockchainTypes: any;
  public showWalletBtn = false;
  public selectedWalletAddress: any;
  public selectedWalletObject: any;
  public selectedChain: any;
  public showSelectMultiKeyError;
  public showSelectSSIDError;
  public showScreen = 1;
  public walletForm: FormGroup;
  public showMnemonicPrivateKey = true;
  public newPrivateKey: any;
  public mnemonic: any;
  public isNewKeyGenerated = false;
  public newWalletAddress;
  public address: any = '';
  public key: any = '';
  public importedKey: any = [];
  public myProfileInfo: any = JSON.parse(localStorage.getItem('myProfile'));;
  public defaultType = 'Private Key';
  constructor(
    private common: CommonService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private blockChain: BlockChainService,
    private loader: SpinnerService,
    private toast: ToastrServiceService,
    public dialogRefActivate: MatDialogRef<AvaliableBlockChainComponent>,
    private network: NetworkService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {

    this.blockchainTypes = [
      { image: 'assets/images/ava.svg', value: 'AVA' },
      { image: 'assets/images/BNB.svg', value: 'BSC' },
      { image: 'assets/images/ethereum.svg', value: 'ETH' },
      { image: 'assets/images/polygon.svg', value: 'POLYGON' },
      // { image: 'assets/images/solana.svg', value: 'Solana' },
      { image: 'assets/images/klaytn.svg', value: 'KLAYTN' },
    ];
    this.showScreen = 1;
    this.common.selectedChain = null;
    this.common.selectedWalletAddress = null;

    this.getBlockChainData();
    this.common.updateBlockChainList.subscribe(data => {
      console.log('Updating block chin data', data);
      if (data) {
        this.getUserKeys();
        this.getBlockChainData();
      }
    });

    this.walletForm = this.formBuilder.group({
      accountName: [null, [Validators.required, Validators.minLength(3)]],
      // type: [null, [Validators.required, Validators.minLength(3)]],
      address: [null, [Validators.required, Validators.minLength(25)]],
      privateKey: [null, [Validators.required, Validators.minLength(50)]],
    });
    // this.walletForm.controls.type.setValue(this.selectedChain);
    // this.walletForm.controls.key.setValue('Private');
    // this.addClass();
  }

  addClass() {
    this.blockchainTypes = this.blockchainTypes;
    this.blockchainTypes.map(async (data: any) => {
      console.log(data);

      const key = data.value + 'PrivateKey';
      console.log(key);

      let key1 = localStorage.getItem(key);
      if (key1) {
        this.previewData.push(JSON.parse(key1));
        console.log(key1);
        console.log(data);
      }
      if (key1) {
        data.class = 'nft_radioItem BC_Imported';
      }
      key1 = '';
    });
  }

  async next() {
    if (this.selectedChain) {
      this.showScreen = 2;
      this.title = this.data.type === 'create' ? 'Select Your Wallet to Mint NFT with' :
        this.data.type === 'view' ? 'Select Any Wallet to View' : 'Select Your Account To Import Your Assets';
      console.log(this.selectedChain);
      this.getBlockChainData(this.selectedChain);
    }
  }

  importKey() {
    this.selectedWalletAddress = null;
    this.common.selectedWalletPrivateKey = null;
    this.common.selectedWalletAddress = null;
    this.showSelectMultiKeyError = false;
    this.selectedWalletObject = {};
    this.showScreen = 3;
    this.title = 'Import Your Key or Paste it';
  }

  async createKey() {
    this.loader.show();
    this.showMnemonicPrivateKey = false;
    const newWallet = await this.blockChain.generateKey();
    this.isNewKeyGenerated = true;
    this.showScreen = 4;
    this.title = 'Generate Your Keys';
    console.log(newWallet);
    this.mnemonic = newWallet.mnemonic.phrase;
    this.newPrivateKey = newWallet.privateKey;
    this.key = newWallet.privateKey;
    this.newWalletAddress = newWallet.address;
    this.address = newWallet.address;
    this.walletForm.controls.privateKey.setValue(this.newPrivateKey);
    this.walletForm.controls.address.setValue(this.newWalletAddress);
    this.loader.hide();
  }

  keyValue(value, type?) {
    if (type === 'private') {
      this.key = value.target.value;
    } else if (type === 'address') {
      this.address = value.target.value;
    }
  }

  selectedCrypto(type) {
    this.selectedChain = type;
    // this.walletForm.controls.type.setValue(type);
    // this.common.selectedChain = type;
    console.log('selected Crypto AvailbelBC', type);
  }

  getUserKeys() {
    this.common.userPrivateKey = localStorage.getItem(`ssid-${this.common.selectedSSID}-privateKey`);
    // this.userPublicKey = localStorage.getItem(`ssid-${this.selectedSSID}-publicKey`);
  }

  async getBlockChainData(chainType?) {
    this.avalaibleBlockChainData = [];
    this.selectedChain = chainType;
    this.common.selectedWalletType = chainType;
    this.common.selectedChain = chainType;
    const id = this.common.selectedSSID;
    this.common.blockChainData.map(async data => {
      const keyName = data.value + 'PrivateKey' + id;
      data.selected = false;
      const obj = await localStorage.getItem(keyName);
      if (data.value === chainType) {
        data.keys = JSON.parse(obj);
        console.log(data.image);
        this.avalaibleBlockChainData.push(data);
      }
      if (this.avalaibleBlockChainData.length >= 1) { this.showWalletBtn = false; } else { this.showWalletBtn = true; }
    });
  }

  selectWallet(item) {
    console.log(item);
    this.selectedWalletAddress = item.address;
    this.common.selectedWalletPrivateKey = item.key;
    this.common.selectedWalletAddress = item.address;
    this.showSelectMultiKeyError = false;
    this.selectedWalletObject = item;
  }

  chooseThisWallet() {
    this.closeModal(this.selectedWalletObject);
  }

  // opencryptowallet() {
  //   const dialogRef = this.dialog.open(CryptoWalletComponent, {
  //     disableClose: true,
  //     height: '800px',
  //     width: '900px',
  //     panelClass: 'ListingPreview',
  //   });

  //   dialogRef.afterClosed().subscribe(item => {
  //     console.log('response back from dialog', item);
  //     this.getBlockChainData();
  //     this.getUserKeys();
  //   });
  // }

  back(showScreen) {
    console.log(showScreen);
    if (showScreen === 1) {
      this.title = 'Select Your Wallet';
      this.common.selectedWalletAddress = null;
      this.common.selectedWalletPrivateKey = null;
      this.selectedWalletAddress = null;
      this.common.selectedChain = null;
    }
    if (showScreen === 2) {
      this.title = this.data.type === 'create' ? 'Select Your Wallet to Mint NFT with' :
        this.data.type === 'view' ? 'Select Any Wallet to View' : 'Select Your Account To Import Your Assets';
      // this.walletForm.controls.accountName.setValue('');
      // this.walletForm.controls.privateKey.setValue('');
      this.mnemonic = null;
      this.newPrivateKey = null;
    }
    // this.walletForm.controls.type.setValue(null);
    this.isNewKeyGenerated = false;
    this.address = '';
    this.key = '';
    // this.walletForm.controls.privateKey.setValue('');
    this.walletForm.reset();
    this.walletForm.clearValidators();

  }

  nameValue(value) {
    const key = this.importedKey.find(obj => obj.key === value.target.value);
    if (key) {
      // this.nameError = true
    }
    //this.nameError = false
  }

  async save() {

    console.log(this.walletForm.valid, this.walletForm.value, this.newWalletAddress, this.address);


    console.log(this.common.selectedSSID);
    if (this.walletForm.valid && this.common.selectedSSID) {
      this.showMnemonicPrivateKey = true;
      const id = this.common.selectedSSID;
      const key = this.selectedChain + 'PrivateKey' + id;
      console.log(key, this.selectedChain);
      this.importedKey = JSON.parse(localStorage.getItem(key)) || [];
      this.importedKey.push({
        key: this.walletForm.value.privateKey || this.key,
        accountName: this.walletForm.value.accountName,
        mnemonic: this.mnemonic,
        address: this.walletForm.value.address || this.newWalletAddress || this.address
      });
      localStorage.setItem(key, JSON.stringify(this.importedKey));
      const resp: any = await this.network.syncKeyFile(
        this.myProfileInfo.firstName, this.myProfileInfo.email, { key, value: this.importedKey });
      console.log(resp);
      this.toast.show('success', 'wallet created sucessfully', '');
      this.walletForm.reset();
      this.walletForm.clearValidators();
      this.mnemonic = null;
      this.newPrivateKey = null;
      this.showScreen = 2;
      this.isNewKeyGenerated = false;
      this.getBlockChainData(this.selectedChain);
      this.common.updateWalletKeys.emit(1);
    }
    else {
      if (!this.walletForm.valid) {
        this.validateAllFormFields(this.walletForm);
      }
      if (!this.common.selectedSSID) {
        this.common.openSSIDDialog();
      }
      console.log('error in Form', this.walletForm.value);
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  async onPaste(type) {
    navigator.clipboard.readText().then(text => {
      if (type === 'key') {
        this.key = text;
        this.key.replace('\r\n', '');
        console.log(this.key);
        this.walletForm.controls.privateKey.setValue(this.key);
      } else if (type === 'address') {
        this.address = text;
        this.address.replace('\r\n', '');
        this.walletForm.controls.key.setValue(this.address);
      }
    })
      .catch(err => {
        console.log('Something went wrong', err);
      });
  }

  copyMnemonicToClipboard(text) {
    console.log(text);
    navigator.clipboard.writeText(text).then((result) => {
      this.toast.show('success', 'Copied to clipboard', '');
    }).catch(err => {
      console.log('Something went wrong', err);
    });
  }

  closeModal(item) {
    item.selectedChain = this.selectedChain;
    if (this.isModal) {
      this.dialogRefActivate.close(item);
    }
  }

  closeDialog() {
    this.dialogRefActivate.close(undefined);
  }

}
