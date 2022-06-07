import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../services/apiServices/api.service';
import { PgpCryptoService } from '../../../services/crypto/pgp-crypto.service';
import { SsidModel } from '../models/sssid.models';
import { CommonService } from '../../../services/common/common.service';
import { Router } from '@angular/router';
import { ipcRenderer } from 'electron';
import * as CryptoJS from 'crypto-js';
import { timeStamp } from 'console';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { SpinnerService } from '../../../services/spinner/spinner.service';
import { setInterval } from 'timers/promises';
import { ToastrServiceService } from '../../../services/toastr/toastr-service.service';
import { IntercomService } from '../../../services/intercom/intercom.service';
import { NetworkService } from '../../../services/network/network.service';
declare const $: any;

@Component({
  selector: 'app-create-ssid',
  templateUrl: './create-ssid.component.html',
  styleUrls: ['./create-ssid.component.scss']
})
export class CreateSsidComponent implements OnInit {
  fileType;
  fileMime;
  fileName;
  file;
  public fileSrc: any;
  fileSelected = false;
  fieldTextType: boolean;
  fieldPswdType: boolean;
  fieldPsdType: boolean;


  myProfileID = localStorage.getItem('profileID');
  newSSID = false;
  id;
  minDOB = new Date();
  public showOnly = false;
  public otp: any;
  public ssid: FormGroup;
  public keysForm: FormGroup;
  public base64Photo: string | ArrayBuffer | null;
  public base64Document: string | ArrayBuffer | null;
  public isDocumentLoaded: boolean;
  public isPhotoLoaded: boolean;
  public isKycPending: boolean;
  public isAddNewSelected: boolean;
  public kycStatus: string;
  public kycDetails: any;
  public userPrivateKey;
  public userPublicKey;
  public sportalPublicKey;
  public showScreen = 1;
  public password;
  public tempExistingKycData: any;
  public myProfileInfo: any = JSON.parse(localStorage.getItem('myProfile'));
  allNFTList = [];
  defaultGender = 'male';
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 1,
      },
      740: {
        items: 3,
      },
      940: {
        items: 3,
      },
    },
    nav: true,
    margin: 10
  };



  constructor(
    public formBuilder: FormBuilder,
    public api: ApiService,
    public pgpCryptoService: PgpCryptoService,
    private router: Router,
    private toast: ToastrServiceService,
    private loader: SpinnerService,
    private icom: IntercomService,
    private network: NetworkService,
    public common: CommonService) {
    if (this.router.getCurrentNavigation()) {
      this.newSSID = this.router.getCurrentNavigation().extras.state.newSSID;
      this.id = this.router.getCurrentNavigation().extras.state.ssid;

    } else {
      this.router.navigate(['/ssid/list']);
    }
  }

  getUserKeys() {
    console.log(this.newSSID, this.common.tempGeneratedKeyData);

    if (this.newSSID) {
      this.userPrivateKey = this.common.tempGeneratedKeyData.privateKey;
      this.userPublicKey = this.common.tempGeneratedKeyData.publicKey;
    } else {
      this.userPrivateKey = localStorage.getItem(`ssid-${this.id}-privateKey`);
      this.userPublicKey = localStorage.getItem(`ssid-${this.id}-publicKey`);
    }
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  toggleFieldPswdType() {
    this.fieldPswdType = !this.fieldPswdType;
  }

  toggleFieldPsdType() {
    this.fieldPsdType = !this.fieldPsdType;
  }


  async ngOnInit(): Promise<void> {
    this.ssid = this.formBuilder.group({
      photo: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      documentImage: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      dob: ['', [Validators.required]],
      documentType: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      documentId: ['', [Validators.required, Validators.pattern('^[a-zA-Z,0-9]*$')]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      state: ['', [Validators.required]],
      country: ['', [Validators.required]]
    });

    this.keysForm = this.formBuilder.group({
      key: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
    this.minDOB.setFullYear(this.minDOB.getFullYear() - 18);
    this.isDocumentLoaded = false;
    this.isPhotoLoaded = false;
    this.isKycPending = false;
    this.kycStatus = 'cannot get status';
    this.isAddNewSelected = false;
    this.getNestPublicKey();
    this.getUserKeys();
    if (!this.newSSID) {
      this.getSSID();
    } else {
      // this.generateSSIDOTP();
    }
    this.getNFTBasedOnSSID();
  }




  async getNFTBasedOnSSID() {
    const result: any = await this.api.apiProcess({
      type: 'getNFT',
      fetchType: 'ssid', ssid: this.id
    }).toPromise();
    // const result: any = await this.api.apiProcess({
    //   type: 'getNFT',
    //   fetchType: 'mine', skip: 0, limit: 20, profileID: this.myProfileID
    // }).toPromise();
    console.log('my NFTS', result.result);
    this.allNFTList = result.result.status;
  }

  goToNFTPreview(nft) {
    this.common.NFT = nft;
    this.router.navigate(['/create-nft/previewNFT']);
  }

  async submitKeys(value) {
    if (this.keysForm.valid) {
      const isKeyDecrypted = await this.decryptPrivateKey(this.tempExistingKycData.encryptedPrivateKey, value.password, value.key);
      if (isKeyDecrypted) {
        this.getUserKeys();
        await this.getNFTBasedOnSSID();
        this.showScreen = 4;
      } else {
        this.toast.show('error', 'Wrong Password Entered', 'please try again with right password.');
      }
    } else {
      this.validateAllFormFields(this.keysForm);
    }
  }

  async getSSID() {
    this.loader.show();
    const res: any = await this.api.apiProcess({ type: 'getSSID', ssid: this.id }).toPromise();
    console.log('my ssid Data', res);
    const existingKycData = res.result.status.data;
    this.tempExistingKycData = existingKycData;
    this.loader.hide();
    if (existingKycData) {

      if (this.userPublicKey && this.userPrivateKey) {
        if (existingKycData.status === 'APPROVED' && !existingKycData.encrypted) {
          // take Password And Encrypt
          this.showScreen = 3;
        }
        else if (existingKycData.status === 'APPROVED' && existingKycData.encrypted) {
          // take password And Decrypt and show Preview
          await this.getNFTBasedOnSSID();
          this.showScreen = 4;
        }
        else {
          // Pending SSID Page
          this.showScreen = 2;
        }
      } else {
        this.showScreen = 5;
      }

    } else {
      this.loader.hide();
    }

  }

  getPassword(event) {
    console.log(event.target.value);
    this.password = event.target.value;
  }

  encryptPassword() {

    this.doubleEncryptKYCAndSave(this.password);
  }

  editView() {
  }

  async decryptKYC(existingKycData, key) {
    this.loader.show();
    this.common.loaderText = 'Decrypting ...';
    console.log({ existingKycData, key });

    try {
      const hash = this.pgpCryptoService.SHA256hashPrivateKey(this.userPublicKey + key);
      console.log(hash);

      let decryptedp3 = await this.decryptAES(existingKycData.p3Data, hash);
      console.log({ decryptedp3, userPrivateKey: this.userPrivateKey });

      (Object.keys(decryptedp3).map(element => {
        if (decryptedp3[element] === 'ERROR') {
          throw new Error();
        }
      }));


      const opendata = decryptedp3;
      decryptedp3 = await this.decryptPGP(opendata, this.userPrivateKey);
      console.log({ decryptedp3 });

      existingKycData.p3Data = decryptedp3;
      const decrypted2 = await this.decryptPGP(existingKycData.p2Data, this.userPrivateKey);
      existingKycData.p2Data = decrypted2;
      this.kycDetails = { ...existingKycData.p2Data, ...existingKycData.p3Data };
      console.log(this.kycDetails);

      this.ssid.setValue({
        name: this.kycDetails.realName,
        dob: new Date(Number(this.kycDetails.dob)),
        documentId: this.kycDetails.documentID,
        documentType: this.kycDetails.documentType,
        address: this.kycDetails.streetAddress,
        city: this.kycDetails.city,
        state: this.kycDetails.state,
        country: this.kycDetails.country,
        gender: this.kycDetails.gender,
        documentImage: '',
        photo: '',
      });

      this.base64Photo = this.kycDetails.userImageWithOTP;
      this.base64Document = this.kycDetails.documentImage;
      this.isPhotoLoaded = true;
      this.isDocumentLoaded = true;
      this.isKycPending = false;
      this.showScreen = 1;
      this.showOnly = true;
      this.loader.hide();
    } catch (error) {
      this.toast.show('error', 'Wrong Password Entered', 'please try again with right password.');
      this.loader.hide();
    }


  }



  generateSSIDOTP() {
    this.api.apiProcess({ type: 'generateSSIDOTP', profileID: this.myProfileID }).subscribe((res: any) => {
      this.otp = res.result.status.data.ssidOtp;
      this.id = res.result.status.data.ssid;
    });
  }

  getNestPublicKey() {
    this.api.apiProcess({ type: 'getNestPublicKey' }).subscribe((res: any) => {
      console.log(res);
      this.sportalPublicKey = res.result.status.Data;
    });
  }
  async submitSSID(ssid) {
    this.loader.show();
    this.common.loaderText = 'Creating New Client ID';
    console.log(ssid, this.ssid.valid);
    if (this.ssid.valid) {
      const kycModel = new SsidModel();
      kycModel.realName = this.ssid.controls.name.value;
      kycModel.dob = await String((this.ssid.controls.dob.value).getTime());
      kycModel.gender = this.ssid.controls.gender.value;
      kycModel.documentID = this.ssid.controls.documentId.value;
      kycModel.documentType = this.ssid.controls.documentType.value;
      kycModel.userImageWithOTP = this.base64Photo;
      kycModel.documentImage = this.base64Document;
      kycModel.streetAddress = this.ssid.controls.address.value;
      kycModel.country = this.ssid.controls.country.value;
      kycModel.city = this.ssid.controls.city.value;
      kycModel.state = this.ssid.controls.state.value;
      console.log(this.userPublicKey, this.sportalPublicKey);
      console.log(this.common.publicKey, this.sportalPublicKey);
      console.log({ ...kycModel });
      let pgpEncryptedKycDetails: any = await this.encryptPGP({ ...kycModel }, [this.userPublicKey, this.sportalPublicKey]);
      pgpEncryptedKycDetails = pgpEncryptedKycDetails.result;
      console.log(pgpEncryptedKycDetails);
      const keys = {
        privateKeyhash: this.common.tempGeneratedKeyData.privateKeyhash,
        publicKeyhash: this.common.tempGeneratedKeyData.publicKeyhash,
        encryptedPrivateKey: this.common.tempGeneratedKeyData.encryptedPrivateKey,
        publicKey: this.common.tempGeneratedKeyData.publicKey,
        name: this.common.tempGeneratedKeyData.name,
      };
      console.log(keys);

      this.api.apiProcess({
        type: 'uploadSSID',
        encryptedPackage: pgpEncryptedKycDetails,
        ssid: this.id,
        keys,
      }).subscribe(async (res: any) => {
        console.log('return from UPLOD KYC', res);
        const resp = res.result.status;
        this.loader.hide();
        if (resp.status === 1) {
          localStorage.setItem(`ssid-${resp.Data.ssid}-publicKey`, this.userPublicKey);
          await this.network.syncKeyFile(
            this.myProfileInfo.firstName, this.myProfileInfo.email, { key: `ssid-${resp.Data.ssid}-publicKey`, value: this.userPublicKey });
          localStorage.setItem(`ssid-${resp.Data.ssid}-privateKey`, this.userPrivateKey);
          await this.network.syncKeyFile(
            this.myProfileInfo.firstName, this.myProfileInfo.email, { key:`ssid-${resp.Data.ssid}-privateKey`, value: this.userPrivateKey });
          this.toast.show('success', 'Client SSID generated successfully', '');
          this.router.navigate(['/ssid/list']);
        } else {
          this.toast.show('error', 'Failed to upload Client ID', 'please try again with in some time.');
        }
      });
    }
    else {
      this.loader.hide();
      this.validateAllFormFields(this.ssid);
    }
  }

  onChange(data) {
  }

  uploadKyc(apiData) {
    this.api.apiProcess(apiData).subscribe(async (res: any) => {
      //  this.hideAddNew();
      this.isAddNewSelected = false;
      this.isKycPending = true;
      //  this.common.refereshMe.next(1);
      console.log(res);
      if (res.data.pendingKYC) {
        this.kycDetails = await this.decryptPGP(res.data.pendingKYC, this.userPrivateKey);
      }

      this.kycStatus = res.data.status || 'PENDING';
      this.ssid.reset();
    });
  }


  importNFT() {
    this.router.navigate(['/nft/import'], { state: { ssid: this.id } });
  }


  openFileBrowser(data) {

  }

  onDocumentSelect(event, data?) {

    if (event.target.files[0].size >= 5000000) {
      alert(
        'File too Big, please select a file less than 5mb');
      return;
    }

    const fileReader = new FileReader();
    fileReader.readAsDataURL(event.target.files[0]); // read file as data url
    fileReader.onload = () => { // called once readAsDataURL is completed
      this.base64Document = fileReader.result;
      this.isDocumentLoaded = true;
      const doc = $('#doc').length ? $('#doc')[0].files[0] : null;
      const form = new FormData();
      form.append('images', doc);
    };
  }

  onPhotoSelect(event, data?) {

    if (event.target.files[0].size >= 5000000) {
      alert(
        'File too Big, please select a file less than 5mb');
      return;
    }

    const fileReader = new FileReader();
    fileReader.readAsDataURL(event.target.files[0]); // read file as data url
    fileReader.onload = () => { // called once readAsDataURL is completed
      this.base64Photo = fileReader.result;
      this.isPhotoLoaded = true;
      const potp = $('#potp').length ? $('#potp')[0].files[0] : null;
      const form = new FormData();
      form.append('images', potp);
    };
  }
  chooseFile(type) {
    if (type === 1) {
      //this.pauseAudio();

      document.getElementById('file-input').click();
    } else {
      document.getElementById('cover-image-input').click();
    }
  }

  async parseFile(event, type) {
    const file = event.target.files[0];
    console.log('I AM GETTING CALL');
    if (file) {
      this.file = file;
      this.fileName = file.name;
      console.log(file);
      this.fileMime = file.type;
      this.fileType = file.type.split('/')[0];
      this.previewFile(file, type);
    }
  };


  previewFile(file, type) {
    let count = 1;
    count += 2;
    const reader = this.getFileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async (e) => {
      console.log(e);
      count += 2;
      let base64 = reader.result.toString();
      if (type === 1) {

        this.base64Photo = base64;
      } else {
        this.base64Document = base64;
      }
      if (this.fileType === 'audio') {
        base64 = base64.split(',')[1];
        console.log(base64);
        this.base64Document = base64;
        this.base64Photo = base64;
        count += 3;
      } else {
        console.log('I AM DINA');
        if (type === 1) {
          this.base64Document = base64;
        } else {
          this.base64Photo = base64;
        }

      }
      this.fileSelected = true;
      setTimeout(() => {
        const playAudio = <HTMLAudioElement>document.getElementById('audioPlay');
        // this.audioDuration = playAudio ? playAudio.duration : 0;
        // this.loader.hideLoader('FILEPROCESS');
        count++;
      }, 300);

    };
    count += 5;
    count += 6;
    this.common.fileSize = this.humanFileSize(file.size, true);
    //this.percentage = (count - 1) * 10;
  }

  humanFileSize(bytes, si = false, dp = 1) {
    const thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }
    const units = si
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;
    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
    return bytes.toFixed(dp) + ' ' + units[u];
  }

  getFileReader(): FileReader {
    const fileReader = new FileReader();
    const zoneOriginalInstance = (fileReader as any).__zone_symbol__originalInstance;
    return zoneOriginalInstance || fileReader;
  }

  async encryptPGP(data, key) {
    console.log({ data, key });

    // const encryptedData = await this.pgpCryptoService.pgpEncryptObject(data, key);

    return new Promise(async (resolve, reject) => {
      const respEvent = await this.icom.processIPC(
        'SSID', 'pgpEncryptObject', { data, publicKeys: [this.userPublicKey, this.sportalPublicKey] });
      console.log({ respEvent });

      ipcRenderer.once(respEvent, (ev, arg) => {
        console.log(arg, ev);
        resolve(arg);
      });
    });

  }

  async decryptPGP(data, key) {
    return new Promise(async (resolve, reject) => {
      const respEvent = await this.icom.processIPC(
        'SSID', 'pgpDecryptObjectIPC', { data, privateKey: key });
      console.log({ respEvent });

      ipcRenderer.once(respEvent, (ev, arg) => {
        console.log(arg, ev);
        resolve(arg.result);
      });
    });
  }

  async encryptPGPSingleField(data, key) {
    return new Promise(async (resolve, reject) => {
      const respEvent = await this.icom.processIPC(
        'SSID', 'pgpEncryptSingleFieldIPC', { element: data, publicKeys: key });
      console.log({ respEvent });

      ipcRenderer.once(respEvent, (ev, arg) => {
        console.log(arg, ev);
        resolve(arg);
      });
    });

  }

  async decryptAES(data, password) {
    try {
      return new Promise(async (resolve, reject) => {
        const respEvent = await this.icom.processIPC(
          'SSID', 'AESDecryptObjectIPC', { data, password });
        console.log({ respEvent });
        ipcRenderer.once(respEvent, (ev, arg) => {
          console.log(arg, ev);
          if (!arg) {
            console.log({ ev });
            throw new Error();
          }
          resolve(arg.result);
        });
      });

      // const decryptedData = await this.pgpCryptoService.AESDecryptObject(data, key);
      // return decryptedData;
    } catch (error) {
      console.log(error);
      this.toast.show('error', 'Wrong Password Entered', 'please try again with right password.');
      this.loader.hide();
    }
  }

  async doubleEncryptKYCAndSave(password) {
    let hash: any = this.pgpCryptoService.SHA256hashPrivateKey(this.userPublicKey + password);
    hash = await this.encryptPGPSingleField(hash, [this.sportalPublicKey]);
    console.log({ hash });

    this.api.apiProcess({ type: 'encryptSSID', profileID: this.myProfileID, ssid: this.id, hash: hash.result }).subscribe((res: any) => {
      this.tempExistingKycData = res.result.status.Data;
      this.decryptKYC(this.tempExistingKycData, password);
      console.log(res.result);
      // this.loader.hideAllLoaders();
    });
  }

  decryptPrivateKey(pvKey, password, key) {
    return new Promise((resolve, reject) => this.pgpCryptoService.decryptPrivateKey(pvKey, password).subscribe(data => {
      if (data.status === 1) {
        this.pgpCryptoService.decryptPrivateKey(data.decrypted.toString(CryptoJS.enc.Utf8), key).subscribe(async data => {
          if (data.status === 1) {
            console.log(data);

            localStorage.setItem(`ssid-${this.id}-publicKey`, this.tempExistingKycData.publicKey);
            localStorage.setItem(`ssid-${this.id}-privateKey`, data.decrypted);
            resolve(true);
          } else {
            this.common.loaderEvent.next(false);
            // this.presentToast('The key is incorrect.');
            resolve(false);
          }
        });
      } else {
        this.common.loaderEvent.next(false);
        // this.presentToast('The password is incorrect.');
        resolve(false);
      }
    }));
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
