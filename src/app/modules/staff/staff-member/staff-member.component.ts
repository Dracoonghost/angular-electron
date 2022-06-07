import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/apiServices/api.service';
import { ToastrServiceService } from '../../../services/toastr/toastr-service.service';
import Swal from 'sweetalert2';
import { SpinnerService } from '../../../services/spinner/spinner.service';
import { CommonService } from '../../../services/common/common.service';

@Component({
  selector: 'app-staff-member',
  templateUrl: './staff-member.component.html',
  styleUrls: ['./staff-member.component.scss']
})
export class StaffMemberComponent implements OnInit {
  jsonData;
  goodResponse = [];
  allSsidList = [];
  clients = [];

  constructor(private router: Router,
    private toast: ToastrServiceService,
    public loader: SpinnerService,
    public common: CommonService,
    private api: ApiService) { }

  async ngOnInit() {
    this.jsonData = history.state;
    console.log(this.jsonData);
    if (!this.jsonData.profileID) {
      this.toast.show('error', 'No Staff Member Selected', 'No Staff Member Selected');
      this.router.navigate(['/staff']);

    }
    this.goodResponse = Object.keys(this.jsonData.accessControl);
    this.clients = this.jsonData.clients || [];
    await this.getAllSsids();
  }

  async getAllSsids(): Promise<void> {
    this.loader.show();
    const res: any = await this.api.apiProcess({ type: 'getAllSSID' }).toPromise();
    console.log('my ssid Data', res);
    res.result.status.data.forEach(element => {
      console.log(element);

      element.isClient = this.jsonData.role === 'admin' ? true : this.clients.includes(element.ssid);
    });
    this.allSsidList = res.result.status.data;

    this.loader.hide();
  }

  updateClientList(selectedSSID) {
    let clients = this.allSsidList.filter(element => {
      if (element.isClient) {
        return element.ssid;
      }
    });
    clients = clients.map(client => client.ssid);
    this.common.loaderText = 'updating the Multi-Sig Contract... ';
    this.loader.show();
    this.api.apiProcess(
      {
        type: 'updateClientList',
        userID: this.jsonData.profileID,
        selectedSSID,
        clients
      }).subscribe((res: any) => {
        this.loader.hide();
        this.common.loaderText = 'loading..';
        if (res.result.status.code) {
          this.toast.show('success', res.result.status.message, res.result.status.message);
        } else {
          this.toast.show('error', res.result.status.message || 'Failed to update List', res.result.status.message);
        }
      });
  }

  updateAcl() {
    if (this.jsonData.role === 'admin') {
      this.toast.show('warning', 'You Cannot Update a Admin Account ACL.', 'You Cannot Update a Admin Account ACL.');
      return;
    }
    this.api.apiProcess(
      {
        type: 'updateAccessControlList',
        userID: this.jsonData.profileID,
        accessControl: this.jsonData.accessControl
      }).subscribe((res: any) => {
        if (res.result.status.code) {
          this.toast.show('success', res.result.status.message, res.result.status.message);
        } else {
          this.toast.show('error', res.result.status.message, res.result.status.message);
        }
      });
  }

  resetPassword() {
    Swal.fire({
      title: 'Are you Sure?',
      text: `You are requesting to reset this account password, a new randomly generated password will be sent to the account's email.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, I am Sure!',
      cancelButtonText: 'No, Cancel it!',
    }).then((isConfirm) => {
      if (isConfirm.isConfirmed) {
        this.api.apiProcess(
          {
            userID: this.jsonData.profileID,
            type: 'requestResetPasswordForStaff',
          }).subscribe((res: any) => {
            if (res.result.status.code) {
              this.toast.show('success', res.result.status.message, res.result.status.message);
            } else {
              this.toast.show('error', res.result.status.message, res.result.status.message);
            }
          });
      } else {
      }
    });
  }

  updateActiveStatus(option) {

    Swal.fire({
      title: 'Are you Sure?',
      text: `You are Updating this Account Active Status to - ${option ? 'Active' : 'Unactive'}!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, I am Sure!',
      cancelButtonText: 'No, Cancel it!',
    }).then((isConfirm) => {
      if (isConfirm.isConfirmed) {
        this.api.apiProcess(
          {
            userID: this.jsonData.profileID,
            type: 'updateStaffActiveStatus',
            option
          }).subscribe((res: any) => {
            if (res.result.status.code) {
              this.toast.show('success', res.result.status.message, res.result.status.message);
            } else {
              this.toast.show('error', res.result.status.message, res.result.status.message);
            }
          });
      } else {
        this.jsonData.active = !option;
      }
    });
  }

}
