import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../../../environments/environment';
import { CommonService } from '../common/common.service';
import { pipe } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private APIServerURL = APP_CONFIG.apiServerURL;
  private BCStackURL = APP_CONFIG.blockChainStackURL;
  private datacenterURL = APP_CONFIG.datacenterURL;
  private AIServerURL = APP_CONFIG.AIServerURL;

  constructor(private http: HttpClient,
    private common: CommonService) { }

  apiProcess(data) {
    console.log(data);
    return this.http.post(this.APIServerURL + '/apiprocess', data);
  }

  getImage(imageUrl: string) {
    return this.http.get(imageUrl, { responseType: 'blob', withCredentials: false });
  }

  getNFTMetadata(url) {
    return this.http.get(url, { withCredentials: false });
  }

  uploadFileToStorj(data) {
    return this.http.post(`${this.BCStackURL}/ava/uploadfile`, data);
  }

  checkIsWhiteListed(data) {
    return this.http.post(`${this.BCStackURL}/aerie/multisig/check/whitelist`, data);
  }

  getNFTSFromRinkeby(tokenAddress) {
    return this.http.post(`${this.BCStackURL}/nest/fetch/nft`, tokenAddress);
  }

  uploadImageToDC(data) {
    return this.http.post(`${this.datacenterURL}/uploadfile`, data);
  }

  reverseAIImageCheck(imageURL) {
    return this.http.get(`${this.AIServerURL}/copyright/api/test?url=${imageURL}`, { withCredentials: false });
  }

  reverseAIImageCheckRAJ(imageURL) {
    return this.http.get(`https://tof-image-similarity.loca.lt/api/train?url=${imageURL}`, { withCredentials: false });
  }

  showLoader() {
    this.common.loaderEvent.next(true);
  }

  hideLoader() {
    this.common.loaderEvent.next(false);
  }

  uploadBulkNftFile(files) {
    return this.http.post(this.APIServerURL + '/bulkNftFileUpload', files);
  }
}
