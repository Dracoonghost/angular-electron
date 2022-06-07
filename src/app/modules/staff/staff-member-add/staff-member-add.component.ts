import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/apiServices/api.service';
import { ToastrServiceService } from '../../../services/toastr/toastr-service.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-staff-member-add',
  templateUrl: './staff-member-add.component.html',
  styleUrls: ['./staff-member-add.component.scss']
})
export class StaffMemberAddComponent implements OnInit {

  staffForm: FormGroup;
  fileToUpload: any = null;
  imageUrl: any = null;
  accessControl;

  constructor(private router: Router,
    private api: ApiService,
    private fb: FormBuilder,
    private toast: ToastrServiceService,
    private cdr: ChangeDetectorRef,
    public dialogRefActivate: MatDialogRef<StaffMemberAddComponent>

    ) { }

  ngOnInit(): void {

    this.staffForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      // username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });

  }

  openFileBrowseForFile(event) {
    event.preventDefault();
    document.getElementById('profilepic').click();
  }


  _createUser(form: FormGroup) {

    console.log(this.fileToUpload, form.value);

    if (
      // this.fileToUpload &&
      form.valid) {
      this.toast.show('warning', 'Creating New User','Creating New User');
      const imageForm = new FormData();
      // imageForm.append('images', this.fileToUpload);

      // const imageUploadApiData = {
      //   code: 'UPLOADTODC',
      //   data: imageForm
      // };
      // this.api.apiProcess(imageUploadApiData).subscribe((resp) => {
      // console.log(resp);
      // console.log(form.value);

      // const imageLink = resp[0];
      const datatoSend = {
        type: 'addMemberInOrganization',
        ...form.value
      };
      // datatoSend.profileImage = imageLink;

      this.api.apiProcess(datatoSend).subscribe((res: any) => {
        console.log(res);
        if (res.result.status.code) {
          this.toast.show('success','New Member added Successfully','New Member added Successfully');
          this.dialogRefActivate.close(true);
        } else {
          this.toast.show('error', 'Error while adding new staff,',res.result.status.message);
        }
      });
      this.cdr.detectChanges();

      // });
    } else {

      this.toast.show('error','Profile Image is required to Fill','Profile Image is required to Fill');

    }


  }

  closeDialog(){
    this.dialogRefActivate.close(false);
  }

}
