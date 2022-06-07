import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as openpgp from 'openpgp';
import * as forge from 'node-forge';
import * as CryptoJS from 'crypto-js';
import { Observable } from 'rxjs';
import { resolve } from 'path';
import { rejects } from 'assert';

const rsa = forge.pki.rsa;




export const encryptTempPrivateKey = async (pvkey, key) => {
    return new Promise((resolve, reject) => {
        try {
            const encrypted = CryptoJS.AES.encrypt(pvkey, key);
            resolve ({
                encrypted: encrypted.toString(),
                code: 1
            });
            
        } catch (error) {
            reject({
                code:0,
                error
            })
        }
    })
}


export const encryptWithAES = async (message, key) => {
    return new Promise((resolve, reject) => {
        try {
            console.log('for encryption: ' + key);
            const encrypted = CryptoJS.AES.encrypt(message, key);
            console.log(encrypted);
            resolve({
                data: encrypted.toString(),
                code: 1
            })
        } catch (error) {
            reject({
                code:0,
                error
            })
        }
    })
}


export const encryptABwithAES = async(arrayBuffer, key) => {
    return new Promise((resolve, reject)=> {
        try {
            const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
            const encrypted = CryptoJS.AES.encrypt(wordArray, key).toString();
            resolve({
                data: encrypted,
                code: 1
            })
        } catch (error) {
            reject({
                code:0,
                error
            })
        }
    })

}

export const convertWordArrayToUint8Array = async (wordArray) => {
    return new Promise((resolve,reject) => {
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
            resolve ({
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

export const decryptABwithAES = async (encrypted, key) => {
    return new Promise((resolve, reject) => {
        try {
            const decrypted = CryptoJS.AES.decrypt(encrypted, key);
            const typedArray = convertWordArrayToUint8Array(decrypted);
            resolve({
                data: typedArray,
                code: 0
            })
        } catch (error) {
            reject({
                code: 0,
                error
            })
        }
    })
}

export const decryptWithAES = async (encrypted, key) => {
    return new Promise((resolve, reject) => {
        try {
            console.log('for decryption: ' + key);
            const decrypted = CryptoJS.AES.decrypt(encrypted.toString(), key.toString('utf8'));
            resolve({
                data: console.log('for decryption: ' + key),
                code: 1
            })
        } catch (error) {
            reject({
                code:0,
                error
            })
        }
    })
}

export const decryptTempPrivateKey = async (encrypted, key) => {
    return new Promise((resolve, reject) => {
        try {
            const decrypted = CryptoJS.AES.decrypt(encrypted.toString(), key.toString('utf8'));
            resolve({
                data: decrypted.toString(CryptoJS.enc.Utf8),
                code: 1
            })
        } catch (error) {
            reject({
                code:0,
                error
            })
        }
    })
}   

export const generateSHA256 = async (value) => {
    return new Promise((resolve,  reject) => {
        try {
            const hash = CryptoJS.SHA256(value);
            resolve({
                data: hash.toString(),
                code:1
            })
        } catch (error) {
            reject({
                code:0,
                error
            })
        }
    })
}

export const SHA256hashPrivateKey = async (key) => {
    return new Promise((resolve, reject) => {
        try {
            resolve({
                data: CryptoJS.SHA256(key).toString(CryptoJS.enc.Hex),
                code:1 
            })
        } catch (error) {
            reject({
                code:0,
                error
            })
        }
    })
}


export const generatePGPKeys = async (profileID, passphrase) => {
    return new Promise((resolve, reject) => {
        try {
            console.log(profileID, passphrase);

            const keys = new Observable<object>(observer => {
                const hash = CryptoJS.SHA1(passphrase);
                const options: any = {
                    userIDs: [{ profileID }], // multiple user IDs
                    numBits: 2048,          // RSA key size
                    hash                   // protects the private key
                };

                openpgp.generateKey(options)
                    .then((key: any) => {

                        observer.next({
                            privateKey: key.privateKeyArmored,
                            publicKey: key.publicKeyArmored
                        });

                    });
            });
            resolve({
                data: keys,
                code:1
            })
            
        } catch (error) {
            reject({
                code: 0,
                error
            })
            
        }
    })
}


export const genEncryptionKey = (password) => {
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



export const encryptPrivateKey = (pvkey, password) => {


    const encPvKey = new Observable<any>(observer => {
        try {
            const iv = forge.random.getBytesSync(16);
            genEncryptionKey(password).subscribe((data: any) => {
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


export const decryptPrivateKey = (pvkey, password) => {
    const decPvKey = new Observable<any>(observer => {
        genEncryptionKey(password).subscribe((data: any) => {
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


export const decodePublicKey = (publicKey) => {
    const tmp = publicKey.toString();
    const decryptedPublicKey = tmp.toString(CryptoJS.enc.Utf8);
    return decryptedPublicKey;
}


export const getOptionsPublicKey = (data, pbKeys) => {
    const promise = new Promise(async (resolve, reject) => {
        const publicKeys = await Promise.all(pbKeys.map(armoredKey => openpgp.readKey({ armoredKey })));
        // console.log({ publicKeys });

        const message = await openpgp.createMessage({ text: data });

        const options = {
            message,
            // resolve all promises returned before
            encryptionKeys: publicKeys,      // for encryption

        };
        // console.log(options);

        resolve(options);
    });
    return promise;
}


export const encryptDatawithPGP = async (data, publicKeys) => {
    // console.log(data, publicKeys);
    // const encryptedData$ = new Observable<any>(observer => {
    //     getOptionsPublicKey(data, publicKeys).then((options : any) => {
    //         //
    //         try {
    //             //
    //             openpgp.encrypt(options).then(ciphertext => {
    //                 // console.log('ciphertext',ciphertext);

    //                 const encrypted = ciphertext;
    //                 observer.next({
    //                     code: 1,
    //                     encrypted
    //                 });
    //             });
    //         } catch (error) {
    //             console.log({ error });

    //             observer.next({
    //                 code: 0,
    //                 error
    //             });
    //         }

    //     });


    // });

    const encryptedData$ = new Promise(async (resolve, reject) => {
        return getOptionsPublicKey(data, publicKeys).then((options: any) => {
            //
            try {
                //
                openpgp.encrypt(options).then(ciphertext => {
                    // console.log('ciphertext',ciphertext);

                    const encrypted = ciphertext;
                    resolve({
                        code: 1,
                        encrypted
                    });
                });
            } catch (error) {
                console.log({ error });

                reject({
                    code: 0,
                    error
                });
            }

        });


    });

    // console.log('encryptedData$', encryptedData$);
    return encryptedData$;
}


// export const getOptionPrivateKey = async (data, pvkey) => {
//     console.log(pvkey);


//     const promise = new Promise(async (resolve, reject) => {
//         const privKeyObj = (await openpgp.key.readArmored(pvkey)).keys[0];
//         // await privKeyObj.decrypt(pin)
//         const options = {
//             message: await openpgp.message.readArmored(data),    // parse armored message
//             decryptionKeys: [pvkey]                                 // for decryption
//         };
//         resolve(options);
//     });
//     return promise;

// }


export const signMessage = async ({ pvkey, challenge }) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('signMessage', { pvkey, challenge });
            challenge = JSON.stringify(challenge)
            const privateKey: any = await openpgp.readKey({ armoredKey: pvkey });

            const cleartextMessage = await openpgp.sign({
                message: await openpgp.createCleartextMessage({ text: challenge }), // CleartextMessage or Message object
                signingKeys: [privateKey], // for signing
                detached: false
            });
            console.log(cleartextMessage);
            resolve({ status: 1, signature: cleartextMessage });


            // const { signature: detachedSignature } = await openpgp.sign({
            //   message: await openpgp.createCleartextMessage({text: challenge}), // CleartextMessage or Message object
            //   privateKeys: [privateKey],                            // for signing
            //   detached: false
            // });
            // // console.log(detachedSignature);
            // return {status:1, signature:detachedSignature}
        } catch (error) {
            console.log('there was an werror', error);
            resolve({ status: 0, error });

        }
    })
    // await privateKey.decrypt(passphrase);
}


// export const verifySignature = async (publicKey, signature, challenge) => {
//     const verified = await openpgp.verify({
//         message: openpgp.cleartext.fromText(challenge),              // CleartextMessage or Message object
//         signature: await openpgp.signature.readArmored(signature), // parse detached signature
//         publicKeys: (await openpgp.key.readArmored(publicKey)).keys // for verification
//     });
//     const { valid }: any = verified.signatures[0];
//     if (valid) {

//     } else {
//         throw new Error('signature could not be verified');
//     }
// }


export const decryptDataWithPGP = async (data, pvkey) => {

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



export const pgpEncryptObject = async ({ data, publicKeys }) => {
    const resp = await new Promise(async (resolve, reject) => {
        resolve(Object.keys(data).reduce(async (prev, element) => {
            const returnVal = await prev;
            returnVal[element] = await pgpEncryptSingleField(data[element], publicKeys);
            return returnVal;
        }, Promise.resolve({})));
    });
    return resp;

}

export const pgpEncryptSingleField = async (element, publicKeys) => {

    return new Promise(async (resolve, reject) => {
        const encdata: any = await encryptDatawithPGP(element, publicKeys)
        resolve(encdata.encrypted);

    });
}

export const pgpEncryptSingleFieldIPC = async ({ element, publicKeys }) => {
    return new Promise(async (resolve, reject) => {
        const encdata: any = await encryptDatawithPGP(element, publicKeys)
        resolve(encdata.encrypted);

    });
}

export const pgpDecryptObject = async (data, privateKey) => {
    return new Promise(async (resolve, reject) => {
        resolve(Object.keys(data).reduce(async (prev, element) => {
            const returnVal = await prev;
            returnVal[element] = await pgpDecryptSingleField(data[element], privateKey);
            return returnVal;
        }, Promise.resolve({})));
    });
}

export const pgpDecryptObjectIPC = async ({ data, privateKey }) => {
    return new Promise(async (resolve, reject) => {
        resolve(Object.keys(data).reduce(async (prev, element) => {
            const returnVal = await prev;
            returnVal[element] = await pgpDecryptSingleField(data[element], privateKey);
            return returnVal;
        }, Promise.resolve({})));
    });
}


export const pgpDecryptSingleField = (element, privateKey) => {
    return new Promise(async (resolve, reject) => {
        const decData: any = await decryptDataWithPGP(element, privateKey);
        resolve(decData.decrypted ? decData.decrypted.data : decData.data);
    });
}


export const aesdecryptSingleField = (data, password) => {
    try {
        return CryptoJS.AES.decrypt(data.toString(), password.toString('utf8')).toString(CryptoJS.enc.Utf8);
    } catch (error) {
        return 'ERROR';
    }
}


export const AESDecryptObject = async (data, password) => {
    return new Promise(async (resolve, reject) => {
        resolve(Object.keys(data).reduce(async (prev, element) => {
            const returnVal = await prev;
            returnVal[element] = await aesdecryptSingleField(data[element], password);
            return returnVal;
        }, Promise.resolve({})));
    });
}

export const AESDecryptObjectIPC = async ({ data, password }) => {

    return new Promise(async (resolve, reject) => {
        try {
            resolve(Object.keys(data).reduce(async (prev, element) => {
                const returnVal = await prev;
                returnVal[element] = await aesdecryptSingleField(data[element], password);
                console.log(returnVal[element]);
                return returnVal;
            }, Promise.resolve({})));
        } catch (error) {
            console.log('AESDecryptObjectIPC', { error });
            reject(1)
        }
    });
}