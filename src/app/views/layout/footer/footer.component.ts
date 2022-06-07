/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NetworkService } from '../../../services/network/network.service';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  myProfile: any = localStorage.getItem('myProfile');
  fileSrc: any;
  fileSelected = false;
  public requestTicketForm: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    private networkService: NetworkService
  ) { }

  ngOnInit(): void {
    this.requestTicketForm = this.formBuilder.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required]],
      message: ['', [Validators.required]],
      documentImage: ['', [Validators.required]],
    });
    this.myProfile = JSON.parse(this.myProfile);
    console.log('?????????????????????????????????',this.myProfile);
    this.requestTicketForm.controls.fullName.setValue(this.myProfile?.firstName || '');
    this.requestTicketForm.controls.email.setValue(this.myProfile?.email || '');
  }

  // setValue() {

  // }

  submitForm(value) {
    console.log(value);
  }

  chooseFile() {
    document.getElementById('file-input').click();
  }

  async parseFile(event) {
    const file = event.target.files[0];
    console.log('I AM GETTING CALL');

    if (file) {
      // this.file = file;
      // this.fileName = file.name;
      // this.fileMime = file.type;
      // this.fileType = file.type.split('/')[0];
      this.previewFile(file);
    }
  };

  previewFile(file) {
    try {
      let count = 1;
      count += 2;
      // if(file.size < 500000){
      // }
      const reader = this.getFileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async (e) => {
        this.fileSrc = reader.result.toString();
        console.log(this.fileSrc);
        this.fileSelected = true;
      };
    } catch (error) {

    }
  }

  getFileReader(): FileReader {
    const fileReader = new FileReader();
    const zoneOriginalInstance = (fileReader as any).__zone_symbol__originalInstance;
    return zoneOriginalInstance || fileReader;
  }

  async openLinkInBrowser(link) {
    await this.networkService.openInBrowser({link});
  }
}
