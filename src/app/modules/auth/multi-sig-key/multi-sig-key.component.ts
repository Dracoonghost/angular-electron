import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/apiServices/api.service';
import { BlockChainService } from '../../../services/blockChain/block-chain.service';
import { CommonService } from '../../../services/common/common.service';
import { NetworkService } from '../../../services/network/network.service';
import { SpinnerService } from '../../../services/spinner/spinner.service';
import { ToastrServiceService } from '../../../services/toastr/toastr-service.service';
declare let $: any;


@Component({
  selector: 'app-multi-sig-key',
  templateUrl: './multi-sig-key.component.html',
  styleUrls: ['./multi-sig-key.component.scss']
})
export class MultiSigKeyComponent implements OnInit {

  public newMultiSigKey;
  public selectedFile: any;
  public selectedFileName: any;
  formValuesToSend;
  public buttonText = 'Proceed';
  private myProfileID: any = JSON.parse(localStorage.getItem('myProfile'));




  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private blockChain: BlockChainService,
    private api: ApiService,
    private toast: ToastrServiceService,
    private router: Router,
    private common: CommonService,
    public dialogRefActivate: MatDialogRef<MultiSigKeyComponent>,
    private network: NetworkService,
    private loader: SpinnerService,
  ) { }

  ngOnInit(): void {
    console.log(this.dialogData);
    this.generateETHKeys();
  }


  async generateETHKeys() {
    const newWallet = await this.blockChain.generateKey();
    this.newMultiSigKey = {
      key: newWallet.privateKey,
      accountName: 'multiSig',
      address: newWallet.address,
    };
  }

  async completeSignUp() {
    const obj = {
      type: 'completeSignup',
      ...this.dialogData,
      address: this.newMultiSigKey.address
    };
    this.buttonText = 'Processing';
    this.common.loaderText = 'Finishing signup process..';
    this.loader.show();
    const resp: any = await this.api.apiProcess(obj).toPromise();
    this.loader.hide();
    this.common.loaderText = 'loading..';
    if (resp.result.status.code === 1) {
      this.buttonText = 'Success';
      const key = 'multiSigKey-' + localStorage.getItem('profileID');
      localStorage.setItem(key, JSON.stringify({
        ...this.newMultiSigKey
      }));
      const saveData = {
        key,
        value: this.newMultiSigKey
      };
      const fileResp: any = await this.network.syncKeyFile(
        this.dialogData.firstName,
        this.common.confirmEmail, saveData);

      this.toast.show('success', resp.result.status.message || 'User Signup Completed Successfully',
        resp.result.status.message);
      this.dialogRefActivate.close();
      this.router.navigate(['/dashboard/home']);
    } else {
      this.buttonText = 'Proceed';
      this.loader.hide();
      this.toast.show('error', resp.result.status.message || 'Failed to Complete Signup', resp.result.status.message);
    }

  }

  chooseFile() {
    document.getElementById('file-input').click();

  }

  async parseFile(event) {
    const file = event.target.files[0];
    console.log(file.name);
    this.selectedFileName = file.name;
    this.selectedFile = file;

  };

  previewFile() {
    // if(file.size < 500000){
    // }
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      console.log(fileReader.result);
      const obj: any = fileReader.result;
      const storageObject = JSON.parse(obj);
      console.log(storageObject);
      Object.keys(storageObject).map(k => {
        console.log(k);
        if (k === 'currentJWT') { return; }
        if (k === 'myProfile') { return; }
        console.log(storageObject[k]);
        localStorage.setItem(k, typeof storageObject[k] === 'object' ? JSON.stringify(storageObject[k]) : storageObject[k]);
      });
      this.toast.show('success', 'Key file imported successfully',
        '');
    };
    fileReader.readAsText(this.selectedFile);
  }

  closeDialog(type) {
    if (type === 0) {
      this.dialogRefActivate.close();
    } else {
      this.previewFile();
      this.dialogRefActivate.close();
    }

  }

  copyMnemonicToClipboard(text) {
    console.log(text);
    navigator.clipboard.writeText(text).then((result) => {
      this.toast.show('success', 'Copied to clipboard', '');
    }).catch(err => {
      console.log('Something went wrong', err);
    });
  }


}
