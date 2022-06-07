import { Component, OnInit } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '../../../../services/common/common.service';
import { PgpCryptoService } from '../../../../services/crypto/pgp-crypto.service';
import { SpinnerService } from '../../../../services/spinner/spinner.service';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { NetworkService } from '../../../../services/network/network.service';


@Component({
  selector: 'app-create-client',
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.scss']
})
export class CreateClientComponent implements OnInit {

  public ssidForm: FormGroup;
  private myProfileID = localStorage.getItem('profileID');
  fieldTextType: boolean;
  fieldPswdType: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private common: CommonService,
    public loader: SpinnerService,
    public pgpCryptoService: PgpCryptoService,
    private router: Router,
    private network: NetworkService,
    public dialogRefActivate: MatDialogRef<CreateClientComponent>
  ) {
    this.ssidForm = this.formBuilder.group({
      name: ['', Validators.required],
      key: ['', [Validators.required, Validators.minLength(8)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
  }

  submit(value) {
    console.log(this.ssidForm.valid, value);
    if (this.ssidForm.valid) {
      this.generateKeys(value);
    } else {
      this.validateAllFormFields(this.ssidForm);
    }
  }

  async generateKeys(params) {
    console.log(this.myProfileID);
    this.loader.show();
    this.common.loaderText = 'Generating SSDID...';
    await new Promise(r => setTimeout(r, 2000));
    const { key, password, name } = params;
    this.pgpCryptoService.generatePGPKeys(this.myProfileID, '').subscribe((data: any) => {
      const tmpPrivateKey = data.privateKey;
      const publicKey = data.publicKey;
      console.log(tmpPrivateKey);
      this.pgpCryptoService.encryptPrivateKey(tmpPrivateKey, key).subscribe((data: any) => {
        this.pgpCryptoService.encryptPrivateKey(data.encrypted, password).subscribe(async (data: any) => {
          if (data.status === 1) {
            const encryptedPrivateKey = data.encrypted;
            const privateKeyhash = CryptoJS.SHA256(tmpPrivateKey).toString(CryptoJS.enc.Hex);
            const publicKeyhash = CryptoJS.SHA256(publicKey).toString(CryptoJS.enc.Hex);
            this.common.tempGeneratedKeyData = {
              privateKeyhash,
              publicKeyhash,
              encryptedPrivateKey,
              publicKey,
              name,
              privateKey: tmpPrivateKey
            };
            this.loader.hide();
            this.common.loaderText = 'Loading...';
            this.dialogRefActivate.close();
            const uuid = await this.network.generateUUID();
            this.router.navigate(['/ssid/create'], { state: { newSSID: true, ssid: uuid } });

          } else {
            this.loader.hide();
            this.common.loaderText = 'Loading...';
            console.log('error while generating keys');

          }
        });
      });
    });
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
    this.loader.hide();
    this.common.loaderText = 'Loading...';
  }

  closeDialog() {
    this.dialogRefActivate.close();
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  toggleFieldPswdType() {
    this.fieldPswdType = !this.fieldPswdType;
  }

}
