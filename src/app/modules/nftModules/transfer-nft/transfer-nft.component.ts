import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from '../../../services/apiServices/api.service';
import { CommonService } from '../../../services/common/common.service';
import { SpinnerService } from '../../../services/spinner/spinner.service';
import { ToastrServiceService } from '../../../services/toastr/toastr-service.service';
import { SsidListComponent } from '../../ssid/ssid-list/ssid-list.component';
@Component({
  selector: 'app-transfer-nft',
  templateUrl: './transfer-nft.component.html',
  styleUrls: ['./transfer-nft.component.scss']
})
export class TransferNftComponent implements OnInit {

  public transferForm: FormGroup;
  public selectedSSIDData: any;
  public ownerAddress;
  constructor(
    private formBuilder: FormBuilder,
    public dialogRefActivate: MatDialogRef<TransferNftComponent>,
    public common: CommonService,
    private loader: SpinnerService,
    private toast: ToastrServiceService,
    public api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.ownerAddress = this.data.currentOwnerAddress;
    console.log(this.ownerAddress, this.common.ssidObject);

    this.transferForm = this.formBuilder.group({
      toAddress: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  ngOnInit(): void {
    this.getAllSsids();
  }

  submit(value) {
    console.log(this.transferForm.valid, value);
    if (this.transferForm.valid) {
      this.checkIsWhiteListed();
    } else {
      this.validateAllFormFields(this.transferForm);
    }
  }

  async getAllSsids(): Promise<void> {
    this.loader.show();
    this.common.loaderText = 'Fetching Client Data...';
    const res: any = await this.api
      .apiProcess({ type: 'getAllSSID', searchText: null })
      .toPromise();
    console.log('my ssid Data', res);
    [this.selectedSSIDData] = res.result.status.data.filter(ssid => ssid.ssid === this.common.ssidObject.ssid);
    if (this.selectedSSIDData.whiteListedAddresses) {
      this.selectedSSIDData.whiteListedAddresses = this.selectedSSIDData.whiteListedAddresses.filter(
        item => item.toLowerCase() !== this.ownerAddress.toLowerCase());
    } else {
      this.selectedSSIDData.whiteListedAddresses = [];
    }

    console.log(this.selectedSSIDData);

    this.loader.hide();
    this.common.loaderText = 'Loading...';
  }

  async checkIsWhiteListed() {
    this.loader.show();
    const res: any = await this.api.checkIsWhiteListed({
      ssid: this.data.ssid,
      address: this.transferForm.value.toAddress
    }).toPromise();

    console.log(res);
    this.loader.hide();

    if (res.status) {
      if (res.isWhiteListed) {
        this.toast.show('success', 'this address is whiteListed and nft can be Transferred to this address', '');
        this.dialogRefActivate.close(this.transferForm.value.toAddress);
      } else {
        this.toast.show('error', 'seems this Address is not in the whiteListed List', 'please try again with whitelisted address');
      }
    } else {
      this.loader.hide();
      this.toast.show('error', 'Failed to Check checkIsWhiteListed', 'please try again with in some time.');
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

  closeDialog() {
    this.dialogRefActivate.close(false);
  }
}
