import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '../../../services/common/common.service';
import { PgpCryptoService } from '../../../services/crypto/pgp-crypto.service';
import * as CryptoJS from 'crypto-js';
import { ApiService } from '../../../services/apiServices/api.service';
import { SpinnerService } from '../../../services/spinner/spinner.service';
import { ToastrServiceService } from '../../../services/toastr/toastr-service.service';
declare const $: any;

@Component({
  selector: 'app-encrypt-private-keys',
  templateUrl: './encrypt-private-keys.component.html',
  styleUrls: ['./encrypt-private-keys.component.scss']
})
export class EncryptPrivateKeysComponent implements OnInit {

  public keysForm: FormGroup;
  public tempExistingKycData: any;
  public userPrivateKey;
  public userPublicKey;
  myProfileID = localStorage.getItem('profileID');
  id;
  fieldPswdType: boolean;
  fieldTextType: boolean;
  
  constructor(
    public formBuilder: FormBuilder,
    public common: CommonService,
    public pgpCryptoService: PgpCryptoService,
    public api: ApiService,
    private loader: SpinnerService,
    private toast: ToastrServiceService,

  ) { }

  ngOnInit(): void {
    this.keysForm = this.formBuilder.group({
      key: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
    this.getSSID();
  }

  toggleFieldPswdType() {
    this.fieldPswdType = !this.fieldPswdType;
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  async submitKeys(value) {
    try {
      const resp = await this.getSSID();
      if (this.keysForm.valid) {
        const isKeyDecrypted = await this.decryptPrivateKey(this.tempExistingKycData.encryptedPrivateKey, value.password, value.key);
        if (isKeyDecrypted) {
          this.getUserKeys();
          $('#encryptPrivateKeys').modal('hide');
        }
      } else {
        this.validateAllFormFields(this.keysForm);
      }
    } catch (error) {
      console.log(error);
    }
  }

  decryptPrivateKey(pvKey, password, key) {
    return new Promise((resolve, reject) => this.pgpCryptoService.decryptPrivateKey(pvKey, password).subscribe(data => {
      if (data.status === 1) {
        this.pgpCryptoService.decryptPrivateKey(data.decrypted.toString(CryptoJS.enc.Utf8), key).subscribe(async pvData => {
          if (pvData.status === 1) {
            localStorage.setItem(`ssid-${this.id}-publicKey`, this.tempExistingKycData.publicKey);
            localStorage.setItem(`ssid-${this.id}-privateKey`, pvData.decrypted);
            this.toast.show('success', 'Client SSID Decrypted and Saved Successfully', '');
            resolve(true);
          } else {
            this.common.loaderEvent.next(false);
            this.toast.show('error', 'Wrong Password Entered', 'please try again with right password.');
            resolve(false);
          }
        });
      } else {
        this.toast.show('error', 'Wrong Password Entered', 'please try again with right password.');
        this.common.loaderEvent.next(false);
        resolve(false);
      }
    }));
  }

  getUserKeys() {
    this.userPrivateKey = localStorage.getItem(`ssid-${this.id}-privateKey`);
    this.userPublicKey = localStorage.getItem(`ssid-${this.id}-publicKey`);
  }

  async getSSID() {
    try {
      if (this.common.selectedSSID) {
        this.loader.show();
        this.id = this.common.selectedSSID;
        const res: any = await this.api.apiProcess(
          { type: 'getSSID', profileID: this.myProfileID, ssid: this.common.selectedSSID }
        ).toPromise();
        console.log('my ssid Data', res);
        this.loader.hide();
        this.tempExistingKycData = res.result.status.data;
      }
    } catch (error) {
      console.log(error);

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
}
