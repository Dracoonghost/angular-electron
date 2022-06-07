import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/apiServices/api.service';
import { BlockChainService } from '../../../services/blockChain/block-chain.service';
import { CommonService } from '../../../services/common/common.service';
import { SpinnerService } from '../../../services/spinner/spinner.service';
import { ToastrServiceService } from '../../../services/toastr/toastr-service.service';

@Component({
  selector: 'app-raise-ticket',
  templateUrl: './raise-ticket.component.html',
  styleUrls: ['./raise-ticket.component.scss']
})
export class RaiseTicketComponent implements OnInit {


  public requestForm: FormGroup;
  requestData: any;
  whiteListedAddresses: any;



  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private formBuilder: FormBuilder,
    public loader: SpinnerService,
    public common: CommonService,
    public blockchain: BlockChainService,
    public api: ApiService,
    private router: Router,
    private toast: ToastrServiceService,
    public dialogRefActivate: MatDialogRef<RaiseTicketComponent>
  ) { }

  ngOnInit(): void {
    this.requestForm = this.formBuilder.group({
      remarks: ['', [Validators.required, Validators.minLength(5)]],
    });
    console.log(this.dialogData);

    if (this.dialogData.type === 'import') {
      this.requestData = [this.dialogData];
    } else {
      this.requestData = this.dialogData;
      // this.whiteListedAddresses = this.dialogData.whiteListedAddresses;
    }
  }

  async raiseRequest() {
    const myMultiSigObject = localStorage.getItem('multiSigKey-' + localStorage.getItem('profileID'));
    console.log(this.common.selectedSSID, this.common.ssidObject);

    if (!this.common.ssidObject.staff[0]) {
      this.toast.show('error', 'No Staff is Assigned for this Client, please assign and then raise Request',
        'go to Staff Section and assign staff to this client ');
      return;
    }
    try {
      this.loader.show();
      this.common.loaderText = 'Creating a  Contract and raising a Ticket...  ';
      const bcResult: any = await this.blockchain.raiseTicket(JSON.parse(myMultiSigObject).key, this.common.selectedSSID);
      console.log({ bcResult });

      if (bcResult.error) {
        this.loader.hide();
        this.toast.show('error', bcResult.error.message || 'Failed to Raise Request', bcResult.error.message);
        return;
      }
      const resp: any = await this.api.apiProcess({
        type: 'raiseRequest',
        assetDetails: this.dialogData.type === 'import' ? this.requestData[0] :  this.requestData.whiteListedAddresses,
        assetID: this.dialogData.type === 'import' ? this.requestData[0].token_id : this.common.selectedSSID,
        requestType: this.dialogData.type === 'import' ? 'import' : 'whiteList',
        remarks: this.requestForm.controls.remarks.value,
        ssid: this.common.selectedSSID,
        ssidName: this.common.ssidObject.name,
        transactionHash: bcResult.transactionHash,
        txnNonce: bcResult.txnNonce,
        ownerAddress: this.dialogData.type === 'import' ? this.common.selectedWalletAddress  : null,
        blockchain: this.dialogData.type === 'import' ? this.common.selectedChain : null,
      }).toPromise();
      this.loader.hide();
      if (resp.result.status.code) {
        this.toast.show('success', 'Request is Raised Successfully',
          'please wait for the Voting to Complete..');
        this.dialogRefActivate.close();
        this.router.navigate(['/request']);

      } else {
        this.toast.show('error', resp.result.status.message || 'Failed to Raise Request', resp.result.status.message);
      }

    } catch (error) {
      console.log({ error });

      this.loader.hide();
      this.toast.show('error', 'Failed to Raise Request from BC', 'Please try again in some time...');
    }

  }

  closeDialog() {
    this.dialogRefActivate.close();
  }

}
