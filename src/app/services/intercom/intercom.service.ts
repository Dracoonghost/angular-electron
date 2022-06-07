import { EventEmitter, Injectable } from '@angular/core';
import mitt from 'mitt';
import { ipcRenderer } from 'electron';
import { v4 as uuid } from 'uuid';


@Injectable({
  providedIn: 'root'
})
export class IntercomService {
  public intercom = new EventEmitter<any>();
  public mittEmitter = mitt();

  constructor() { }

  async processIPC(internalModule, type, payload) {
    try {
      const id = uuid();
      payload = { ...payload, id };
      const data = {
        internalModule, type, payload, id,
      };
      ipcRenderer.send('IPCCALL', data);
      return 'IPCCALLRESP_' + id;
      
    } catch (error) {
      
    }
  }
}
