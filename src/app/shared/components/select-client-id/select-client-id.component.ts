import { Component, OnInit } from '@angular/core';
// import { AvaliableSSIDComponent } from '../avaliable-ssid/avaliable-ssid.component';
import { CommonService } from '../../../services/common/common.service';


@Component({
  selector: 'app-select-client-id',
  templateUrl: './select-client-id.component.html',
  styleUrls: ['./select-client-id.component.scss']
})
export class SelectClientIDComponent implements OnInit {
  showSelectSSIDError;
  constructor(
    public common: CommonService
  ) { }

  ngOnInit(): void {
  }

  openSSIDDialog(){
    this.common.openSSIDDialog();
  }



}
