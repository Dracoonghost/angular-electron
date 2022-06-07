import { screen } from 'electron';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../../services/apiServices/api.service';
import { SpinnerService } from '../../services/spinner/spinner.service';
import { CommonService } from '../../services/common/common.service';
import { ToastrServiceService } from '../../services/toastr/toastr-service.service';

@Component({
  selector: 'app-no-ai-check',
  templateUrl: './no-ai-check.component.html',
  styleUrls: ['./no-ai-check.component.scss']
})
export class NoAiCheckComponent implements OnInit {
  base64 = 'Base64...';
  fileSelected?: Blob;
  filePath: string;
  myForm: FormGroup;
  file;
  public nftData: any;
  img: any;
  message: any;
  status: any;
  keyPoint1: any;
  keyPoint2: any;
  score: any;


  constructor(
    public fb: FormBuilder,
    public api: ApiService,
    private loader: SpinnerService,
    private common: CommonService,
    private toast: ToastrServiceService
  ) {
    this.myForm = this.fb.group({
      img: [null],
      filename: ['']
    });
  }

  ngOnInit(): void {
  }

  imagePreview(e) {
    this.file = (e.target as HTMLInputElement).files[0];
    console.log(this.file);

    this.myForm.patchValue({
      img: this.file
    });

    this.myForm.get('img').updateValueAndValidity();


    const reader = new FileReader();
    reader.onload = () => {
      this.filePath = reader.result as string;
      console.log(this.filePath);
      console.log(reader);
    };
    reader.readAsDataURL(this.file);
  }
  chooseFile() {
    document.getElementById('file-input').click();
  }
  async submit() {
    this.loader.show();
    this.common.loaderText = 'uploading and checking with AI Database..';
    console.log(this.myForm, this.nftData);
    let thumbnail = '';
    const form = new FormData();
    form.append('images', this.file);

    try {
      const files = await this.api.uploadImageToDC(form).toPromise();
      console.log(files);
      thumbnail = files[0];
      console.log(thumbnail);

      const response: any = await this.api.reverseAIImageCheck(thumbnail).toPromise();
      this.loader.hide();
      console.log(response);
      this.keyPoint1 = response.img.keyPoint1;
      this.keyPoint2 = response.img.keyPoint2;
      this.message = response.message;
      this.score = response.img.score;
      this.status = response.status;
      this.img = response.img.matchedImg;
    } catch (error) {
      this.loader.hide();
      this.toast.show('error', 'Failed to test Image this time', 'please try again in some time.');
    }
    this.common.loaderText = 'loading..';
  }

}
