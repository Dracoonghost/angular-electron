import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/apiServices/api.service';
import { CommonService } from '../../../services/common/common.service';
// import { AvaliableSSIDComponent } from '../../../shared/components/avaliable-ssid/avaliable-ssid.component';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs';
declare let SignaturePad: any;
declare let $: any;


@Component({
  selector: 'app-create-nft',
  templateUrl: './create-nft.component.html',
  styleUrls: ['./create-nft.component.scss']
})
export class CreateNftComponent implements OnInit {

  public location: any;
  public locationError = false;
  public latitude: number;
  public longitude: number;
  public zoom: number;
  public address: string;
  public allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/tiff'];
  public fileType: String;
  public fileMime: String;
  public fileName: String;
  public coverImage: any;
  public fileSelected = false;
  public file;
  public percentage = 0;
  public audioDuration = 0;
  public coverImageURL = 'assets/img/mp3_cover.png';
  public signaturePad: any;
  public signData: any = null;
  public _tags: any = [];
  public _selectedTag: any = [];
  public avalaibleBlockChainData: any = [];
  public selectedWalletPrivateKey: any;
  public selectedWalletAddress: any;
  public selectedChain: any;
  public showScreen = 1;
  public myImage: any;
  public PE: any;
  public peAlreadyExists = false;
  public PEAvailable = false;
  public peText: any;
  public allSsidList: any = [];
  public showWalletBtn = false;
  public myProfileID = localStorage.getItem('profileID');
  public showSignError = false;
  public showSelectSSIDError = false;
  public selectFileError = false;
  public NFTForm: FormGroup;
  public fileSrc: any;

  constructor(
    private formBuilder: FormBuilder,
    private api: ApiService,
    private router: Router,
    public common: CommonService,
    public dialog: MatDialog
  ) {
    this.NFTForm = this.formBuilder.group({
      name: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(500)]],
      description: [null, [Validators.required]],
      royalties: [0, [Validators.required]],
      price: [1, [Validators.required]],
      explicitContent: [true, Validators.required],
      category: ['', Validators.required],
      personalizedEndpoint: ['', Validators.required],
      city: ['London', [Validators.required]],
      state: ['England', [Validators.required]],
      country: ['United Kingdom', [Validators.required]],
      tags: [''],
    });
  }

  ngOnInit(): void {
    if (this.common.editNFT) {
      this.signData = null;
      this.editNFT();
      if (!this.common.selectedSSID) {
        this.common.openSSIDDialog();
      }
    } else {
      this.common.ssidObject = {};
      this.common.selectedSSID = null;
      this.common.openSSIDDialog();
    }

    // this.common.updateWalletKeys.subscribe(data => {
    //   console.log(data);
    //   if (data) {
    //     this.getBlockChainData();
    //   }
    // });

    const canvas: any = document.getElementById('signature-pad');
    function resizeCanvas() {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext('2d').scale(ratio, ratio);
    }
    window.onresize = resizeCanvas;
    resizeCanvas();
    let signaturePad = new SignaturePad(canvas, { backgroundColor: 'rgb(255, 255, 255)' });

    document.getElementById('save-sign').addEventListener('click', () => {
      if (signaturePad.isEmpty()) {
        console.log('error');
        $('.signature-pad').addClass('errorShow');
      }
      else {
        $('.signature-pad').removeClass('errorShow');
        const data = signaturePad.toDataURL('image/svg+xml');
        console.log('Got my Sign ');
        localStorage.setItem('sign', data);
        this.showSignError = false;
        this.signData = data;
      }
    });

    signaturePad = new SignaturePad(document.getElementById('signature-pad'), {
      onEnd() { document.getElementById('save-sign').click(); }
    });
    document.getElementById('clear').addEventListener('click', () => {
      signaturePad.clear();
      localStorage.setItem('sign', null);
      this.signData = null;
    });
    if (document.getElementById('undo')) {
      document.getElementById('undo').addEventListener('click', () => {
        const data = signaturePad.toData();
        if (data) {
          data.pop(); // remove the last dot or line
          signaturePad.fromData(data);
        }
        if (signaturePad.isEmpty()) {
          localStorage.setItem('sign', null);
          this.signData = null;
        } else {
          $('.signature-pad').removeClass('errorShow');
          const sign = signaturePad.toDataURL('image/svg+xml');
          localStorage.setItem('sign', sign);
          this.signData = sign;
        }
      });
    }
    this.NFTForm.get('personalizedEndpoint').valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(data => {
      this.setURL(data);
    });

    this.NFTForm.get('tags').valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(data => {
      this.search(data);
    });

    $(document).ready(function() {
      //Add a minus icon to the collapse element that is open by default
      $('.collapse.show').each(function() {
        $(this).parent().find('.fa').removeClass('fa-plus').addClass('fa-minus');
      });
      //Toggle plus/minus icon on show/hide of collapse element
      $('.collapse').on('shown.bs.collapse', function() {
        $(this).parent().find('.fa').removeClass('fa-plus').addClass('fa-minus');
      }).on('hidden.bs.collapse', function() {
        $(this).parent().find('.fa').removeClass('fa-minus').addClass('fa-plus');
      });
    });
  }

  editNFT() {
    console.log(this.common.NFT);
    this.fileSrc = this.common.NFT.fileSrc;
    this.NFTForm.controls.name.setValue(this.common.NFT.name);
    this.NFTForm.controls.description.setValue(this.common.NFT.description);
    this.NFTForm.controls.price.setValue(this.common.NFT.price);
    this.NFTForm.controls.royalties.setValue(this.common.NFT.royalties);
    this.NFTForm.controls.explicitContent.setValue(this.common.NFT.explicitContent);
    this.NFTForm.controls.personalizedEndpoint.setValue(this.common.NFT.personalizedEndpoint);
    this.NFTForm.controls.city.setValue(this.common.NFT.city);
    this.NFTForm.controls.country.setValue(this.common.NFT.country);
    this.NFTForm.controls.state.setValue(this.common.NFT.state);
    this._selectedTag = this.common.NFT.tags;
    this.NFTForm.controls.category.setValue(this.common.NFT.category);
    // this.signData = this.common.NFT.signatureSVG;
    this.selectedWalletPrivateKey = true;
    this.selectedWalletAddress = this.common.NFT.ownerAddress;
    this.fileMime = this.common.NFT.fileMime;
    this.fileType = this.common.NFT.fileType;
    this.coverImage = this.common.NFT.coverImage;
    this.file = this.common.NFT.file;
    this.latitude = this.common.NFT.latitude;
    this.longitude = this.common.NFT.longitude;

  }


  async search(evt) {
    const term = evt;
    if (term.length <= 0) {
      this._tags = [];
    }
    else {
      const searchResult: any = await this.api.apiProcess({
        type: 'searchWithTerm',
        term: term.toLowerCase(), offset: 0, searchType: 'TAGS', size: 10
      }).toPromise();
      console.log(searchResult);
      if (searchResult.result.status.code === 0) { return; }
      this._tags = searchResult.result.status.tags.body.hits.hits;
      if (term.length >= 2) { this._tags.push({ _source: { tag: term, useCount: 0 } }); }
    }
  }

  selectTag(tag) {
    if (!this._selectedTag.includes(tag)) {
      this._selectedTag.push(tag);
      this.NFTForm.controls.tags.setValue('');
    }
  }

  removeTag(tag) {
    this._selectedTag = this._selectedTag.filter(item => item !== tag);
  }

  preview() {
    this.common.editNFT = false;
    this.router.navigate(['/create-nft/previewNFT']);
  }

  saveMe(data, step?) {
    console.log(data, this.NFTForm.valid,);
    this.showSignError = false;
    this.showSelectSSIDError = false;
    if (this.NFTForm.valid &&
      this.signData &&
      this.common.selectedSSID &&
      this.fileSrc &&
      this.NFTForm.controls.city.value !== undefined &&
      this.NFTForm.controls.country.value !== undefined &&
      this.NFTForm.controls.state.value !== undefined &&
      !this.peAlreadyExists) {
      if (step === 1) {
        this.launchPreview();
      }
    } else {
      this.validateAllFormFields(this.NFTForm);
      if (!this.signData) { this.showSignError = true; }
      if (!this.common.selectedSSID) { this.showSelectSSIDError = true; }
      if (!this.fileSrc) { this.selectFileError = true; }
    }
  }

  launchPreview() {
    const NFT = {
      name: this.NFTForm.value.name,
      description: this.NFTForm.value.description,
      price: this.NFTForm.value.price,
      royalties: this.NFTForm.value.royalties,
      coverImageURL: this.fileType === 'audio' ? this.coverImageURL : this.fileSrc,
      fileSrc: this.fileSrc,
      audioDuration: this.audioDuration,
      personalizedEndpoint: this.NFTForm.value.personalizedEndpoint,
      file: this.file,
      coverImage: this.fileType === 'audio' ? this.coverImage : this.file,
      explicitContent: this.NFTForm.value.explicitContent,
      category: this.NFTForm.value.category,
      fileType: this.fileType,
      fileMime: this.fileMime,
      tags: this._selectedTag,
      signatureSVG: this.signData,
      city: this.NFTForm.value.city || 'London',
      country: this.NFTForm.value.country || 'United Kingdom',
      state: this.NFTForm.value.state || 'England',
      latitude: this.latitude || 51.515687666759874,
      longitude: this.longitude || -0.12924363787272242,
      ssidName: this.common.ssidObject.name,
      ssid: this.common.ssidObject.ssid,
      fileSize: this.common.fileSize,
      ownerAddress: '',
      blockchain: '',
      edit: true
    };
    this.common.NFT = NFT;
    // this.reverseImageCheck();
    this.preview();
    console.log(NFT);

  }

  async reverseImageCheck() {
    if (this.common.NFT.fileType !== 'audio') {
      // this.loader.showLoader('Reverse checking....', 'REVERSECHECK');
      const form = new FormData();
      form.append('images', this.common.NFT.coverImage);
      const files = await this.api.uploadImageToDC(form).toPromise();
      this.common.NFT.thumbnail = files[0];
      console.log(this.common.NFT.coverImage);

      const response: any = await this.api.reverseAIImageCheck(this.common.NFT.thumbnail).toPromise();
      console.log(response);
      //  this.loader.hideLoader('REVERSECHECK');
      if (response.status === 1) {

        Swal.fire({
          title: 'Are you sure?',
          text: 'You will not be able to recover this imaginary file!',
          // icon: ...response.img,
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
        }).then((result) => {
          if (result.isConfirmed) {
            console.log('Clicked Yes, File deleted!');
            // this.getBlockChainData();
          } else if (result.isDismissed) {
            console.log('Clicked No, File is safe!');
            this.preview();
          }
        });
      } else {
        Swal.fire({
          title: 'No Match Found!!',
          text: `Congratulations! ${response.data.scannedImages}
           pieces were searched in ${response.data.duration}
           seconds and your image has not yet been registered.
            It will be added and protected once you create your blockchain registration.,`,
          showCancelButton: true,
          confirmButtonText: 'Continue',
          cancelButtonText: 'cancel',
        }).then((result) => {

          if (result.isConfirmed) {
            this.preview();
            console.log('Clicked Yes, File deleted!');

          } else if (result.isDismissed) {
            // this.getBlockChainData();
            console.log('Clicked No, File is safe!');

          }
        });
      }
    } else {
      // this.getBlockChainData();
      // document.getElementById("openModalButton").click();
    }

  }

  chooseFile(type) {
    if (type === 1) {
      this.pauseAudio();
      document.getElementById('file-input').click();
    } else {
      document.getElementById('cover-image-input').click();
    }
  }

  pauseAudio() {
    const playAudio = <HTMLAudioElement>document.getElementById('audioPlay');
    if (playAudio) {
      console.log(playAudio.currentTime, playAudio.duration);
      playAudio.pause();
      // this.audioDuration = playAudio.duration;
      // this.listening = false;
    }
  }

  async parseFile(event) {
    const file = event.target.files[0];
    console.log('I AM GETTING CALL');

    if (file) {
      this.file = file;
      this.fileName = file.name;
      console.log(file);
      this.fileMime = file.type;
      this.fileType = file.type.split('/')[0];
      this.previewFile(file);
    }
  };

  previewFile(file) {
    let count = 1;
    count += 2;
    // if(file.size < 500000){
    // }
    const reader = this.getFileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async (e) => {
      console.log(e);
      count += 2;
      let base64 = reader.result.toString();
      if (this.fileType === 'audio') {
        base64 = base64.split(',')[1];
        console.log(base64);
        // setInterval(() => {
        //   if (this.percentage < 100) { this.percentage += 1; }
        //   else { clearInterval(this.percentage); }
        // }, 50);
        // this.fileSrc = this.sanitizer.bypassSecurityTrustUrl("data:audio/webm;base64," + base64);
        count += 3;
      } else {
        console.log('I AM DINA');

        this.fileSrc = base64;
        // setInterval(() => {
        //   if (this.percentage < 100)
        //     this.percentage += 1;
        //   else
        //     clearInterval(this.percentage);
        // }, 50);

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

  async setURL(evt) {
    console.log(evt);
    const url = evt.trim().replace(/\s+/g, '-');
    this.PE = url.toLowerCase();
    if (url.length > 3) {
      this.peText = 'Checking...';
      const x: any = await this.api.apiProcess({ type: 'checkNFTPEExists', personalizedEndpoint: this.PE }).toPromise();
      console.log(x);
      this.peAlreadyExists = x.result.status.alreadyExists;
      if (!x.result.status.alreadyExists) {
        this.peText = 'Avaliable';
      } else if (x.result.status.alreadyExists) {
        this.peText = 'Not Available';
      }
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

  getLocation(location: any) {
    console.log(location);
    if (location.state === undefined || location.city === undefined || location.country === undefined) {
      this.locationError = true;
    } else {
      this.latitude = location.latitude,
        this.longitude = location.longitude,
        this.NFTForm.controls.city.setValue(location.city);
      this.NFTForm.controls.country.setValue(location.country);
      this.NFTForm.controls.state.setValue(location.state);
      this.locationError = false;
    }
  }

}

