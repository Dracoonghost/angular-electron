import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import * as net from 'net';
import * as http from 'http';

import { IntercomService } from '../intercom/intercom.service';


@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  intercom: any;
  mittEmitter: any;

  constructor(
    private icom: IntercomService,
  ) {
    this.intercom = icom.intercom;
    this.mittEmitter = this.icom.mittEmitter;
  }

  updateOnlineStatus = () => {
    const connectionStatus = navigator.onLine ? true : false;
    this.mittEmitter.emit('isOnline', connectionStatus);
    this.startUpdateListner();
    return connectionStatus;
  };

  startUpdateListner() {
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
  }

  async generateUUID() {
    return new Promise(async (resolve, reject) => {
      const respEvent = await this.icom.processIPC('NETWORK', 'generateUUID', {});
      ipcRenderer.once(respEvent, (event, arg) => {
        console.log('Arggg>>>>', arg);
        resolve(arg.result);
      });
    });
  }

  async downloadFile(url, appDir) {
    const respEvent = await this.icom.processIPC('NETWORK', 'downloadFile', { url, appDir });
    ipcRenderer.once(respEvent, (event, arg) => {
      console.log('Arggg>>>>', arg);
      return arg;
    });
  }

  async hashFile(path) {
    console.log(path);
    return new Promise(async (resolve, reject) => {
      const respEvent = await this.icom.processIPC('NETWORK', 'hashFile', { path });
      ipcRenderer.once(respEvent, (event, arg) => {
        console.log('Arggg>>>>', event, arg);
        resolve(arg.result);
      });
    });
  }

  async uploadFile(data) {
    return new Promise(async (resolve, reject) => {
      const respEvent = await this.icom.processIPC('NETWORK', 'uploadFile', { ...data });
      ipcRenderer.once(respEvent, (event, arg) => {
        console.log('Arggg>>>>', arg);
        resolve(arg.result);
      });
    });
  }

  async downloadFileInAppDirectory(data) {

    return new Promise(async (resolve, reject) => {
      try {
        const respEvent = await this.icom.processIPC('NETWORK', 'downloadFileInAppDirectory', { ...data });
        ipcRenderer.once(respEvent, (event, arg) => {
          console.log('downloadFileInAppDirectory', { event, arg });
          resolve(arg);
        });
      } catch (error) {
        console.log('downloadFileInAppDirectory', { error });
        resolve({ error });
      }
    });

  }

  async deletFileInAppDirectory(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const respEvent = await this.icom.processIPC('NETWORK', 'deleteFileInAppDir', { data });
        ipcRenderer.once(respEvent, (event, arg) => {
          resolve(arg);
        });
      } catch (error) {
        reject({ error });
      }
    });

  }

  async checkFileExistsInAppDir(name) {
    const respEvent = await this.icom.processIPC('NETWORK', 'checkFileExistsInAppDir', { name });
    ipcRenderer.once(respEvent, (event, arg) => {
      console.log(arg);
      return arg;
    });
  }

  async getNFTMetadata(url) {
    return new Promise(async (resolve, reject) => {
      try {
        const respEvent = await this.icom.processIPC('NETWORK', 'getNFTMetadata', { url });
        console.log({ respEvent });

        ipcRenderer.once(respEvent, (event, arg) => {
          console.log('getNFTMetadata', { event, arg });
          resolve(arg.result);
        });
      } catch (error) {
        console.log('getNFTMetadata', { error });
        reject({ error });
      }

    });
  }


  async getIPAdress() {
    const client = net.connect({ port: 80, host: 'google.com' }, () => {
      const myIP = client.localAddress;
      console.log(myIP);
      return myIP;
    });
  }

  async getPublicIP() {
    http.get({ host: 'api.ipify.org', port: 80, path: '/' }, function(resp) {
      resp.on('data', function(ip) {
        const publicIP = '' + ip;
        console.log(publicIP);
        return publicIP;
      });
    });
  }

  async signMessage(pvkey, challenge) {
    return new Promise(async (resolve, reject) => {
      const respEvent = await this.icom.processIPC(
        'SSID', 'signMessage', { challenge, pvkey });
      console.log({ respEvent });

      ipcRenderer.once(respEvent, (ev, arg) => {
        console.log(arg, ev);
        resolve(arg.result);
      });
    });
  }

  async openInBrowser(data) {
    return new Promise(async (resolve, reject) => {
      const respEvent = await this.icom.processIPC('NETWORK', 'openInBrowser', { data });
      ipcRenderer.once(respEvent, (event, arg) => {
        console.log('Arggg>>>>', arg);
        resolve(arg.result);
      });
    });
  }

  async importNFTKLAYTN(data) {
    return new Promise(async (resolve, reject) => {
      const respEvent = await this.icom.processIPC('BLOCKCHAIN', 'importNFTKLAYTN', { data });
      ipcRenderer.once(respEvent, (event, arg) => {
        console.log('Arggg>>>>', arg);
        resolve(arg.result);
      });
    });
  }

  async syncKeyFile(userName, email, key) {
    return new Promise(async (resolve, reject) => {
      const respEvent = await this.icom.processIPC('NETWORK', 'syncKeyFile', { userName, email, key });
      ipcRenderer.once(respEvent, (event, arg) => {
        console.log('Arggg>>>>', arg);
        resolve(arg.result);
      });
    });
  }

  async bulkWriteLocalstorage(userName, email, keys) {
    return new Promise(async (resolve, reject) => {
      const respEvent = await this.icom.processIPC('NETWORK', 'bulkWriteLocalstorage', { userName, email, keys });
      ipcRenderer.once(respEvent, (event, arg) => {
        console.log('Arggg>>>>', arg);
        resolve(arg.result);
      });
    });
  }
}
