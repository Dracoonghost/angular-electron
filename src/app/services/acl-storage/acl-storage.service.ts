import { Injectable } from '@angular/core';
import jwtDecode from 'jwt-decode';
@Injectable({
  providedIn: 'root'
})
export class AclStorageService {
  public userACL: Object;
  public userToken;
  public decodedToken;
  public username;
  public profileImage;
  public profileID;
  public email;
  constructor() { }

 public getDecodedUserToken(token: string): any {
    try{
      this.decodedToken = jwtDecode(token);
      console.log(this.decodedToken);

      this.profileID = this.decodedToken.payload.profileID;
      this.userACL = this.decodedToken.payload.accessControl;
        return this.decodedToken;
    }
    catch(Error){
        return null;
    }
  }

}
