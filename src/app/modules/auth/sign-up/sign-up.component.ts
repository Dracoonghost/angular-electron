import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, interval, Subscription } from 'rxjs';
import { ApiService } from '../../../services/apiServices/api.service';
import { MustMatch } from '../helper/must-match.validator';

import { BlockChainService } from '../../../services/blockChain/block-chain.service';
//import swal from 'sweetalert';
import { CommonService } from '../../../services/common/common.service';
import { ToastrServiceService } from '../../../services/toastr/toastr-service.service';
import { MultiSigKeyComponent } from '../multi-sig-key/multi-sig-key.component';
import { MatDialog } from '@angular/material/dialog';

declare let $: any;
@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  signupForm: FormGroup;
  verification: FormGroup;
  emailRegex = /^[a-zA-Z0-9@.]+$/;
  flowCount = 1;
  countDown = 60;
  emailOK = false;
  formValuesToSend;
  public username = '';
  public usernameOK = false;
  public showCountDown = 60;
  private subscription: Subscription;
  fieldTextType: boolean;
  fieldPswdType: boolean;


  constructor(
    private formBuilder: FormBuilder,
    private api: ApiService,
    public common: CommonService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    if (this.common.confirmSignUp) {
      this.flowCount = 1;
      console.log(this.common.confirmEmail);

      // this.sendEmail(this.common.confirmEmail);
      // this.subscription = interval(1000).subscribe(x => { this.getDiductionValue(); });
    }

    this.signupForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: this.common.confirmEmail, disabled: true }, Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      username: [null, [Validators.required, Validators.minLength(3)]],
      termsAndCondition: [false, Validators.requiredTrue]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
    this.verification = this.formBuilder.group({
      verificationOTP: ['', Validators.required]
    });

    this.signupForm.get('email').valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(data => {
      this.checkEmail(data);
    });
  }


  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  toggleFieldPswdType() {
    this.fieldPswdType = !this.fieldPswdType;
  }


  async sendEmail(email) {
    console.log(email);

    const obj = {
      type: 'resendEmailConfirmationOTPToUser',
      email: email || this.common.confirmEmail
    };
    const resp: any = await this.api.apiProcess(obj).toPromise();
    console.log(resp);
  }

  get f() { return this.signupForm.controls; }

  async onRegister(formValue) {
    this.common.loaderEvent.next(true);
    if (formValue.termsAndCondition && this.signupForm.valid) {

      this.formValuesToSend = { ...formValue };
      const dialogRef = this.dialog.open(MultiSigKeyComponent, {
        disableClose: true,
        height: '500px',
        width: '700px',
        panelClass: 'ListingPreview',
        data: this.formValuesToSend
      });

      dialogRef.afterClosed().subscribe(item => {
        console.log('response back from dialog', item);
      });
    } else {
      this.common.loaderEvent.next(false);
      this.validateAllFormFields(this.signupForm);
    }
  }




  async checkEmail(email) {
    if (this.signupForm.controls.email.valid) {
      console.log(this.signupForm.controls.email.valid);
      document.getElementById('spin').style.display = 'inline-block';
      const obj = {
        type: 'checkIfEmailExists',
        email: this.signupForm.value.email,
      };
      const resp: any = await this.api.apiProcess(obj).toPromise();
      document.getElementById('spin').style.display = 'none';
      console.log(resp, resp.result.code);
      if (resp.result.status.code === 0) {
        $('#check').removeClass('hide');
        $('#err').addClass('hide');
        this.emailOK = true;
        this.signupForm.value.email = email;
      } else {
        $('#err').removeClass('hide');
        $('#check').addClass('hide');
        this.emailOK = false;
        // swal('Email Alerdy Registered');
      }
    } else {
      this.emailOK = false;
      $('#err').addClass('hide');
      $('#check').addClass('hide');
    }
  }

  checkUsername(event) {
    const username = event.target.value;
    if (!(this.signupForm.controls.username.hasError('required'))) {
      if (username.length > 2) {
        document.getElementById('spin1').style.display = 'inline-block';
        const apiData = {
          type: 'checkIfUsernameExists', username
        };
        this.api.apiProcess(apiData).subscribe((data: any) => {
          document.getElementById('spin1').style.display = 'none';
          if (data.result.status.isUsernameAvailable) {
            $('#check1').removeClass('hide');
            $('#err1').addClass('hide');

            this.usernameOK = true;
            this.username = username;
            // this.cdr.detectChanges();
          } else {
            $('#err1').removeClass('hide');
            $('#check1').addClass('hide');
            this.usernameOK = false;
            // this.cdr.detectChanges();
          }
        });
      } else {
        this.usernameOK = false;
        $('#err1').addClass('hide');
        $('#check1').addClass('hide');
      }
    } else {
      $('#err1').addClass('hide');
      $('#check1').addClass('hide');
      this.usernameOK = false;
      // this.cdr.detectChanges();
    }
  }

  getErrorMessage() {
    if (this.signupForm.controls.email.hasError('required')) {
      return 'You must enter a value';
    }

    return this.signupForm.controls.email.hasError('email') ? 'Not a valid email' : '';
  }

  getDiductionValue() {
    this.showCountDown = this.countDown--;
    if (this.countDown === 0) {
      this.showCountDown = 0;
      this.subscription.unsubscribe();
    }
  }

  async onRegisterVerify(otp) {
    this.common.loaderEvent.next(true);
    console.log(this.verification, otp);
    if (this.verification) {
      const obj = {
        type: 'verifyEmail',
        otp: otp.verificationOTP,
        email: this.signupForm.value.email || this.common.confirmEmail
      };
      const resp: any = await this.api.apiProcess(obj).toPromise();
      if (resp.result.status.code === 1) {
        this.flowCount = 3;
      }
      else {
      }
      this.common.loaderEvent.next(false);
    } else {
      this.validateAllFormFields(this.verification);
    }
  }

  prev() {
    this.flowCount = 1;
    this.subscription.unsubscribe();
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

  terms() {
    window.open("https://nes.tech/nest-terms/", '_blank');
  }
  pp() {
    window.open("https://nes.tech/nest-privacy/", '_blank');
  }
}
