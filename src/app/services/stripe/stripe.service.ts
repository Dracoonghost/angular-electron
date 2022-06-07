import { Injectable } from '@angular/core';
import { ApiService } from '../apiServices/api.service';
import { CommonService } from '../common/common.service';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  constructor(
    private api: ApiService,
    private common: CommonService
  ) { }

  async saveCard(card) {
    console.log(card);
    if (card) {
      const dts = {
        type: 'saveCard',
        source: card,
        profileID: this.common.myProfileID
      }
      const res: any = await this.api.apiProcess(dts).toPromise();
      console.log('response from Save Card',res);

      return {
        status: 1,
        result: res.result
      };
    }
    return {
      status: 0,
      error: card.error,
    }
  }

  async listCards() {
    const dts = {
      type: 'listCards',
      profileID: this.common.myProfileID
    };
    const res: any = await this.api.apiProcess(dts).toPromise();
    console.log(res);
    return res.result.status.data || [];
  }
}
