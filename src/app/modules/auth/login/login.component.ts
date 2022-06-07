import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { ApiService } from '../../../services/apiServices/api.service';
//import swal from 'sweetalert';
import { CommonService } from '../../../services/common/common.service';
import { SpinnerService } from '../../../services/spinner/spinner.service';
import { AclStorageService } from '../../../services/acl-storage/acl-storage.service';
import { ToastrServiceService } from '../../../services/toastr/toastr-service.service';
import { MatDialog } from '@angular/material/dialog';
declare let openpgp: any;
import { MultiSigKeyComponent } from '../../../modules/auth/multi-sig-key/multi-sig-key.component';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  showOTP = false;
  countDown = 60;
  public showCountDown = 60;
  emailError = '';
  emailOK = true;
  emailRegex = /^[a-zA-Z0-9@.]+$/;
  emailErrors = {
    required: 'Please enter your username/email.',
    pattern: 'Please enter a valid username/email.',
  };
  pleaseWait = false;
  private subscription: Subscription;
  fieldPswdType: boolean;


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private api: ApiService,
    private common: CommonService,
    private spinner: SpinnerService,
    public acl: AclStorageService,
    private toast: ToastrServiceService,
    private dialog: MatDialog
  ) { }


  ngOnInit(): void {
    console.log(openpgp);
    const token = localStorage.getItem('currentJWT');
    console.log(token);
    if (token !== null && token !== 'null') {
      this.router.navigate(['/dashboard/home']);
    }
    this.loginForm = this.formBuilder.group({
      Email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  toggleFieldPswdType() {
    this.fieldPswdType = !this.fieldPswdType;
  }

  async onLoggedin(formValue) {
    this.spinner.show();
    this.pleaseWait = true;
    this.common.confirmEmail = formValue.Email.trim().toLowerCase();

    if (this.loginForm.valid) {
      const obj = {
        type: 'login',
        email: formValue.Email.trim().toLowerCase(),
        password: formValue.password
      };

      const resp: any = await this.api.apiProcess(obj).toPromise();
      if (resp.result.status.code === 1) {
        this.common.currentJWT = resp.result.status.session.JWT;
        localStorage.setItem('currentJWT', resp.result.status.session.JWT);
        this.acl.getDecodedUserToken(resp.result.status.session.JWT);
        localStorage.setItem('profileID', resp.result.status.session.profileID);
        this.common.myProfileID = resp.result.status.session.profileID;
        if (resp.result.status.result.message.includes('Email is not Confirmed')) {
          this.router.navigate(['/signup']);
          this.common.confirmSignUp = true;
        } else {
          const dialogRef = this.dialog.open(MultiSigKeyComponent, {
            disableClose: true,
            height: '500px',
            width: '700px',
            panelClass: 'ListingPreview',
            data: true
          });

          dialogRef.afterClosed().subscribe(item => {
            console.log('response back from dialog', item);
            this.router.navigate(['/dashboard/home']);
            this.pleaseWait = false;
          });


        }
      }
      else {
        this.toast.show('error', resp.result.status.result.message, 'please try again.');
        this.pleaseWait = false;
      }
      this.spinner.hide();
    } else {
      this.spinner.hide();
      this.pleaseWait = false;
      this.validateAllFormFields(this.loginForm);
    }
  }

  emailValidation(email) {
    (<HTMLInputElement>document.getElementById('exampleInputEmail1')).value = 'Login';
    if (email === '') {
      this.emailError = this.emailErrors.required;
      this.emailOK = false;
    }
    else if (!this.emailRegex.test(email)) {
      this.emailError = this.emailErrors.pattern;
      this.emailOK = false;
    }
    else {
      this.emailOK = true;
    }
  }



  next() {
    if (this.loginForm.value.Email) {
      this.showOTP = true;
      this.subscription = interval(1000)
        .subscribe(x => { this.getDiductionValue(); });
      console.log(this.loginForm);
    } else {
    }
  }

  getDiductionValue() {
    this.showCountDown = this.countDown--;
    if (this.countDown === 0) {
      this.showCountDown = 0;
      this.subscription.unsubscribe();
    }
  }

  sendAgain() {
    console.log('send again email', this.loginForm.value);
  }

  keyDownFunction(event) {
    if (event.keyCode === 13) {
      this.onLoggedin(this.loginForm.value);
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

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
