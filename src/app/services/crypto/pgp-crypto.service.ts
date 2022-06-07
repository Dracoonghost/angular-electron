import { Injectable } from '@angular/core';
import * as forge from 'node-forge';
import * as CryptoJS from 'crypto-js';
import { Observable } from 'rxjs';
declare let openpgp: any;
// import * as openpgp from 'openpgp';
// import * as openpgp from "openpgp/dist/openpgp";

@Injectable({
  providedIn: 'root'
})
export class PgpCryptoService {

  rsa: any = forge.pki.rsa;

  constructor(
  ) { }

  encryptTempPrivateKey(pvkey, key) {
    const encrypted = CryptoJS.AES.encrypt(pvkey, key);
    return encrypted.toString();
  }

  encryptWithAES(message, key) {
    console.log('for encryption: ' + key);
    const encrypted = CryptoJS.AES.encrypt(message, key);
    console.log(encrypted);

    return encrypted.toString();
  }

  encryptABwithAES(arrayBuffer, key) {
    const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
    const encrypted = CryptoJS.AES.encrypt(wordArray, key).toString();
    return encrypted;
  }

  convertWordArrayToUint8Array(wordArray) {
    return new Promise((resolve, reject) => {
      try {
        const arrayOfWords = wordArray.hasOwnProperty('words') ? wordArray.words : [];
        const length = wordArray.hasOwnProperty('sigBytes') ? wordArray.sigBytes : arrayOfWords.length * 4;
        const uInt8Array = new Uint8Array(length); let index = 0; let word; let i;
        for (i = 0; i < length; i++) {
          word = arrayOfWords[i];
          uInt8Array[index++] = word >> 24;
          uInt8Array[index++] = (word >> 16) & 0xff;
          uInt8Array[index++] = (word >> 8) & 0xff;
          uInt8Array[index++] = word & 0xff;
        }
        resolve({
          data: uInt8Array,
          code: 1
        })
      } catch (error) {
        reject({
          code: 0,
          error
        })
      }
    })
  }

  decryptABwithAES(encrypted, key) {
    const decrypted = CryptoJS.AES.decrypt(encrypted, key);
    const typedArray = this.convertWordArrayToUint8Array(decrypted);
    return typedArray;
  }

  decryptWithAES(encrypted, key) {
    console.log('for decryption: ' + key);
    const decrypted = CryptoJS.AES.decrypt(encrypted.toString(), key.toString('utf8'));
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  decryptTempPrivateKey(encrypted, key) {
    const decrypted = CryptoJS.AES.decrypt(encrypted.toString(), key.toString('utf8'));
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  generateSHA256(value) {
    const hash = CryptoJS.SHA256(value);
    return hash.toString();
  }

  SHA256hashPrivateKey(key) { return CryptoJS.SHA256(key).toString(CryptoJS.enc.Hex); }

  generatePGPKeys(profileID, passphrase) {
    console.log(profileID, passphrase);

    const keys = new Observable<object>(observer => {
      const hash = CryptoJS.SHA1(passphrase);
      const options = {
        userIDs: [{ profileID }], // multiple user IDs
        numBits: 2048,          // RSA key size
        hash                   // protects the private key
      };

      openpgp.generateKey(options)
        .then((key) => {

          observer.next({
            privateKey: key.privateKeyArmored,
            publicKey: key.publicKeyArmored
          });

        });
    });
    return keys;
  }

  genEncryptionKey(password) {
    const encKey = new Observable<object>(observer => {

      const key = CryptoJS.PBKDF2(password, password, {
        keySize: 32,
        iterations: 20000
      });
      const keyString = key.toString();
      observer.next({
        key: keyString
      });
    });
    return encKey;
  }


  encryptPrivateKey(pvkey, password) {


    const encPvKey = new Observable<any>(observer => {
      try {
        const iv = forge.random.getBytesSync(16);
        this.genEncryptionKey(password).subscribe((data: any) => {
          //

          const key = data.key;
          const encrypted = CryptoJS.AES.encrypt(pvkey, key.toString('utf8'), { iv });


          const decrypted = CryptoJS.AES.decrypt(encrypted.toString(), key.toString('utf8'));
          const originalData = decrypted.toString(CryptoJS.enc.Utf8);

          observer.next({
            status: 1,
            encrypted: encrypted.toString()
          });
        });
      } catch (error) {
        observer.next({
          status: 0,
          error
        });
      }

    });
    return encPvKey;
  }

  decryptPrivateKey(pvkey, password) {
    const decPvKey = new Observable<any>(observer => {
      this.genEncryptionKey(password).subscribe((data: any) => {
        const key = data.key;
        try {
          const decrypted = CryptoJS.AES.decrypt(pvkey.toString(), key.toString('utf8'));
          const originalData = decrypted.toString(CryptoJS.enc.Utf8);
          observer.next({
            status: 1,
            decrypted: originalData
          });
        } catch (error) {
          observer.next({
            status: 0
          });
        }
      });
    });
    return decPvKey;
  }

  decodePublicKey(publicKey) {
    const tmp = publicKey.toString();
    const decryptedPublicKey = tmp.toString(CryptoJS.enc.Utf8);
    return decryptedPublicKey;
  }

  getOptionsPublicKey(data, pbKeys) {
    const promise = new Promise(async (resolve, reject) => {
      const publicKeys = await Promise.all(pbKeys.map(armoredKey => openpgp.readKey({ armoredKey })));

      const message = await openpgp.createMessage({ text: data });

      const options = {
        message,
        // resolve all promises returned before
        encryptionKeys: publicKeys,      // for encryption

      };
      console.log(options);

      resolve(options);
    });
    return promise;
  }

  encryptDatawithPGP(data, publicKeys) {
    console.log(data);
    const encryptedData$ = new Observable<any>(observer => {
      this.getOptionsPublicKey(data, publicKeys).then(options => {
        //
        try {
          //
          openpgp.encrypt(options).then(ciphertext => {
            console.log(ciphertext);

            const encrypted = ciphertext;
            observer.next({
              code: 1,
              encrypted
            });
          });
        } catch (error) {
          observer.next({
            code: 0,
            error
          });
        }

      });


    });

    return encryptedData$;
  }

  async getOptionPrivateKey(data, pvkey) {
    console.log(pvkey);


    const promise = new Promise(async (resolve, reject) => {
      const privKeyObj = (await openpgp.key.readArmored(pvkey)).keys[0];
      // await privKeyObj.decrypt(pin)
      const options = {
        message: await openpgp.message.readArmored(data),    // parse armored message
        decryptionKeys: [pvkey]                                 // for decryption
      };
      resolve(options);
    });
    return promise;

  }

  async signMessage(pvkey, challenge) {
    try {
      console.log(pvkey, challenge);

      const privateKey = await openpgp.readKey({ armoredKey: pvkey });

      const cleartextMessage = await openpgp.sign({
        message: await openpgp.createCleartextMessage({ text: challenge }), // CleartextMessage or Message object
        signingKeys: [privateKey], // for signing
        detach: true
      });
      console.log(cleartextMessage);
      return { status: 1, signature: cleartextMessage };


      // const { signature: detachedSignature } = await openpgp.sign({
      //   message: await openpgp.createCleartextMessage({text: challenge}), // CleartextMessage or Message object
      //   privateKeys: [privateKey],                            // for signing
      //   detached: false
      // });
      // // console.log(detachedSignature);
      // return {status:1, signature:detachedSignature}
    } catch (error) {
      console.log('there was an werror', error);
      return { status: 0, error };
    }
    // await privateKey.decrypt(passphrase);
  }

  async verifySignature(publicKey, signature, challenge) {
    const verified = await openpgp.verify({
      message: openpgp.cleartext.fromText(challenge),              // CleartextMessage or Message object
      signature: await openpgp.signature.readArmored(signature), // parse detached signature
      publicKeys: (await openpgp.key.readArmored(publicKey)).keys // for verification
    });
    const { valid }: any = verified.signatures[0];
    if (valid) {

    } else {
      throw new Error('signature could not be verified');
    }
  }

  async decryptDataWithPGP(data, pvkey) {

    try {
      // let options = await this.getOptionPrivateKey(data, pvkey);
      // console.log(options);

      const message = await openpgp.readMessage({
        armoredMessage: data // parse armored message
      });
      const privateKey: any = await openpgp.readKey({ armoredKey: pvkey });
      const decrypted = await openpgp.decrypt({
        message,
        decryptionKeys: [privateKey] // for decryption
      });
      if (decrypted.data) {
        return decrypted;
      } else {
        console.log('some erro');
      }

    } catch (error) {
      console.log('some erro occured while decrypting');
      console.log(error);

      return { data };

    }
  }


  async pgpEncryptObject(data, publicKeys) {
    return new Promise(async (resolve, reject) => {
      resolve(Object.keys(data).reduce(async (prev, element) => {
        const returnVal = await prev;
        returnVal[element] = await this.pgpEncryptSingleField(data[element], publicKeys);
        return returnVal;
      }, Promise.resolve({})));
    });
  }
  pgpEncryptSingleField(element, publicKeys) {
    return new Promise((resolve, reject) => {
      this.encryptDatawithPGP(element, publicKeys).subscribe(encdata => {
        resolve(encdata.encrypted);
      });
    });
  }
  async pgpDecryptObject(data, privateKey) {
    return new Promise(async (resolve, reject) => {
      resolve(Object.keys(data).reduce(async (prev, element) => {
        const returnVal = await prev;
        returnVal[element] = await this.pgpDecryptSingleField(data[element], privateKey);
        return returnVal;
      }, Promise.resolve({})));
    });
  }

  pgpDecryptSingleField(element, privateKey) {
    return new Promise(async (resolve, reject) => {
      const decData: any = await this.decryptDataWithPGP(element, privateKey);
      resolve(decData.decrypted ? decData.decrypted.data : decData.data);
    });
  }

  aesdecryptSingleField(data, password) {
    return CryptoJS.AES.decrypt(data.toString(), password.toString('utf8')).toString(CryptoJS.enc.Utf8);
  }

  async AESDecryptObject(data, password) {
    return new Promise(async (resolve, reject) => {
      resolve(Object.keys(data).reduce(async (prev, element) => {
        const returnVal = await prev;
        returnVal[element] = await this.aesdecryptSingleField(data[element], password);
        return returnVal;
      }, Promise.resolve({})));
    });
  }



}
