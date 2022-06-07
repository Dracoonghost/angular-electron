import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { ApiService } from '../../../services/apiServices/api.service';

@Component({
  selector: 'app-bulk-nft',
  templateUrl: './bulk-nft.component.html',
  styleUrls: ['./bulk-nft.component.scss']
})
export class BulkNFTComponent implements OnInit {

  public headers = ['ID', 'Name', 'Age', 'Gender', 'Country'];
  public data: [][];
  public validationErrors = [];
  public file: File = null;
  public validFile = false;
  public fileFormData: any;
  public isChecked = false;
  public locationObject;


  constructor(
    private api: ApiService,
    private router: Router) { }

  ngOnInit(): void {

  }
  onFileChange(evt: any) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const target: DataTransfer = <DataTransfer>(evt.target);
    this.file = null;
    this.isChecked = false;
    if (target.files.length !== 1) { throw new Error('Cant use multiple files'); };

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];

      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      this.data = (XLSX.utils.sheet_to_json(ws, {}));
      this.file = target.files[0];
      console.log(this.file);

      const form = new FormData();
      form.append('files', this.file);
      this.fileFormData = form;
    };
    reader.readAsBinaryString(target.files[0]);
  }

  bulkUpload() {
    document.getElementById('formFileLg').click();
  }

  fileValidate() {
    this.validationErrors = [];

    this.data.forEach((nft: any) => {
      if (typeof nft.imageUrl !== 'string' || nft.image === 'undefined' || nft.image === null || nft.description === '') {
        this.validationErrors.push({ name: nft.name, image: 'missing image', rowNum: nft.__rowNum__ });
      }
      if (typeof nft.description !== 'string' || nft.description === 'undefined' || nft.description === null || nft.description === '') {
        this.validationErrors.push({ name: nft.name, image: 'missing description', rowNum: nft.__rowNum__ });
      }
      if (typeof nft.name !== 'string' || nft.name === 'undefined' || nft.name === null || nft.name === '') {
        this.validationErrors.push({ name: nft.name, image: 'missing Name', rowNum: nft.__rowNum__ });
      }
    });
    this.isChecked = true;
    if (this.validationErrors.length === 0) {
      this.validFile = true;
      console.log('>>>>>> Valid file', this.validFile);

    } else if (this.validationErrors.length > 0) {
      this.validFile = false;
    }
  }
  uploadSheet() {
    if (this.validationErrors.length === 0) {
      this.api.uploadBulkNftFile(this.fileFormData).subscribe((res: any) => {

        if (res.result.status.code === 1) {
          this.router.navigate([`/nft/bulk/${res.result.status.data.batchID}`],);
        }
      });

    } else if (this.validationErrors.length > 0) {
      console.log('>>>>>> Not Valid file', this.validFile);
    }
  }

}
