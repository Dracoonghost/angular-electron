"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AESDecryptObjectIPC = exports.AESDecryptObject = exports.aesdecryptSingleField = exports.pgpDecryptSingleField = exports.pgpDecryptObjectIPC = exports.pgpDecryptObject = exports.pgpEncryptSingleFieldIPC = exports.pgpEncryptSingleField = exports.pgpEncryptObject = exports.decryptDataWithPGP = exports.signMessage = exports.encryptDatawithPGP = exports.getOptionsPublicKey = exports.decodePublicKey = exports.decryptPrivateKey = exports.encryptPrivateKey = exports.genEncryptionKey = exports.generatePGPKeys = exports.SHA256hashPrivateKey = exports.generateSHA256 = exports.decryptTempPrivateKey = exports.decryptWithAES = exports.decryptABwithAES = exports.convertWordArrayToUint8Array = exports.encryptABwithAES = exports.encryptWithAES = exports.encryptTempPrivateKey = void 0;
var openpgp = require("openpgp");
var forge = require("node-forge");
var CryptoJS = require("crypto-js");
var rxjs_1 = require("rxjs");
var rsa = forge.pki.rsa;
var encryptTempPrivateKey = function (pvkey, key) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                try {
                    var encrypted = CryptoJS.AES.encrypt(pvkey, key);
                    resolve({
                        encrypted: encrypted.toString(),
                        code: 1
                    });
                }
                catch (error) {
                    reject({
                        code: 0,
                        error: error
                    });
                }
            })];
    });
}); };
exports.encryptTempPrivateKey = encryptTempPrivateKey;
var encryptWithAES = function (message, key) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                try {
                    console.log('for encryption: ' + key);
                    var encrypted = CryptoJS.AES.encrypt(message, key);
                    console.log(encrypted);
                    resolve({
                        data: encrypted.toString(),
                        code: 1
                    });
                }
                catch (error) {
                    reject({
                        code: 0,
                        error: error
                    });
                }
            })];
    });
}); };
exports.encryptWithAES = encryptWithAES;
var encryptABwithAES = function (arrayBuffer, key) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                try {
                    var wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
                    var encrypted = CryptoJS.AES.encrypt(wordArray, key).toString();
                    resolve({
                        data: encrypted,
                        code: 1
                    });
                }
                catch (error) {
                    reject({
                        code: 0,
                        error: error
                    });
                }
            })];
    });
}); };
exports.encryptABwithAES = encryptABwithAES;
var convertWordArrayToUint8Array = function (wordArray) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                try {
                    var arrayOfWords = wordArray.hasOwnProperty('words') ? wordArray.words : [];
                    var length_1 = wordArray.hasOwnProperty('sigBytes') ? wordArray.sigBytes : arrayOfWords.length * 4;
                    var uInt8Array = new Uint8Array(length_1);
                    var index = 0;
                    var word = void 0;
                    var i = void 0;
                    for (i = 0; i < length_1; i++) {
                        word = arrayOfWords[i];
                        uInt8Array[index++] = word >> 24;
                        uInt8Array[index++] = (word >> 16) & 0xff;
                        uInt8Array[index++] = (word >> 8) & 0xff;
                        uInt8Array[index++] = word & 0xff;
                    }
                    resolve({
                        data: uInt8Array,
                        code: 1
                    });
                }
                catch (error) {
                    reject({
                        code: 0,
                        error: error
                    });
                }
            })];
    });
}); };
exports.convertWordArrayToUint8Array = convertWordArrayToUint8Array;
var decryptABwithAES = function (encrypted, key) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                try {
                    var decrypted = CryptoJS.AES.decrypt(encrypted, key);
                    var typedArray = (0, exports.convertWordArrayToUint8Array)(decrypted);
                    resolve({
                        data: typedArray,
                        code: 0
                    });
                }
                catch (error) {
                    reject({
                        code: 0,
                        error: error
                    });
                }
            })];
    });
}); };
exports.decryptABwithAES = decryptABwithAES;
var decryptWithAES = function (encrypted, key) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                try {
                    console.log('for decryption: ' + key);
                    var decrypted = CryptoJS.AES.decrypt(encrypted.toString(), key.toString('utf8'));
                    resolve({
                        data: console.log('for decryption: ' + key),
                        code: 1
                    });
                }
                catch (error) {
                    reject({
                        code: 0,
                        error: error
                    });
                }
            })];
    });
}); };
exports.decryptWithAES = decryptWithAES;
var decryptTempPrivateKey = function (encrypted, key) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                try {
                    var decrypted = CryptoJS.AES.decrypt(encrypted.toString(), key.toString('utf8'));
                    resolve({
                        data: decrypted.toString(CryptoJS.enc.Utf8),
                        code: 1
                    });
                }
                catch (error) {
                    reject({
                        code: 0,
                        error: error
                    });
                }
            })];
    });
}); };
exports.decryptTempPrivateKey = decryptTempPrivateKey;
var generateSHA256 = function (value) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                try {
                    var hash = CryptoJS.SHA256(value);
                    resolve({
                        data: hash.toString(),
                        code: 1
                    });
                }
                catch (error) {
                    reject({
                        code: 0,
                        error: error
                    });
                }
            })];
    });
}); };
exports.generateSHA256 = generateSHA256;
var SHA256hashPrivateKey = function (key) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                try {
                    resolve({
                        data: CryptoJS.SHA256(key).toString(CryptoJS.enc.Hex),
                        code: 1
                    });
                }
                catch (error) {
                    reject({
                        code: 0,
                        error: error
                    });
                }
            })];
    });
}); };
exports.SHA256hashPrivateKey = SHA256hashPrivateKey;
var generatePGPKeys = function (profileID, passphrase) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                try {
                    console.log(profileID, passphrase);
                    var keys = new rxjs_1.Observable(function (observer) {
                        var hash = CryptoJS.SHA1(passphrase);
                        var options = {
                            userIDs: [{ profileID: profileID }],
                            numBits: 2048,
                            hash: hash // protects the private key
                        };
                        openpgp.generateKey(options)
                            .then(function (key) {
                            observer.next({
                                privateKey: key.privateKeyArmored,
                                publicKey: key.publicKeyArmored
                            });
                        });
                    });
                    resolve({
                        data: keys,
                        code: 1
                    });
                }
                catch (error) {
                    reject({
                        code: 0,
                        error: error
                    });
                }
            })];
    });
}); };
exports.generatePGPKeys = generatePGPKeys;
var genEncryptionKey = function (password) {
    var encKey = new rxjs_1.Observable(function (observer) {
        var key = CryptoJS.PBKDF2(password, password, {
            keySize: 32,
            iterations: 20000
        });
        var keyString = key.toString();
        observer.next({
            key: keyString
        });
    });
    return encKey;
};
exports.genEncryptionKey = genEncryptionKey;
var encryptPrivateKey = function (pvkey, password) {
    var encPvKey = new rxjs_1.Observable(function (observer) {
        try {
            var iv_1 = forge.random.getBytesSync(16);
            (0, exports.genEncryptionKey)(password).subscribe(function (data) {
                //
                var key = data.key;
                var encrypted = CryptoJS.AES.encrypt(pvkey, key.toString('utf8'), { iv: iv_1 });
                var decrypted = CryptoJS.AES.decrypt(encrypted.toString(), key.toString('utf8'));
                var originalData = decrypted.toString(CryptoJS.enc.Utf8);
                observer.next({
                    status: 1,
                    encrypted: encrypted.toString()
                });
            });
        }
        catch (error) {
            observer.next({
                status: 0,
                error: error
            });
        }
    });
    return encPvKey;
};
exports.encryptPrivateKey = encryptPrivateKey;
var decryptPrivateKey = function (pvkey, password) {
    var decPvKey = new rxjs_1.Observable(function (observer) {
        (0, exports.genEncryptionKey)(password).subscribe(function (data) {
            var key = data.key;
            try {
                var decrypted = CryptoJS.AES.decrypt(pvkey.toString(), key.toString('utf8'));
                var originalData = decrypted.toString(CryptoJS.enc.Utf8);
                observer.next({
                    status: 1,
                    decrypted: originalData
                });
            }
            catch (error) {
                observer.next({
                    status: 0
                });
            }
        });
    });
    return decPvKey;
};
exports.decryptPrivateKey = decryptPrivateKey;
var decodePublicKey = function (publicKey) {
    var tmp = publicKey.toString();
    var decryptedPublicKey = tmp.toString(CryptoJS.enc.Utf8);
    return decryptedPublicKey;
};
exports.decodePublicKey = decodePublicKey;
var getOptionsPublicKey = function (data, pbKeys) {
    var promise = new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
        var publicKeys, message, options;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(pbKeys.map(function (armoredKey) { return openpgp.readKey({ armoredKey: armoredKey }); }))];
                case 1:
                    publicKeys = _a.sent();
                    return [4 /*yield*/, openpgp.createMessage({ text: data })];
                case 2:
                    message = _a.sent();
                    options = {
                        message: message,
                        // resolve all promises returned before
                        encryptionKeys: publicKeys, // for encryption
                    };
                    // console.log(options);
                    resolve(options);
                    return [2 /*return*/];
            }
        });
    }); });
    return promise;
};
exports.getOptionsPublicKey = getOptionsPublicKey;
var encryptDatawithPGP = function (data, publicKeys) { return __awaiter(void 0, void 0, void 0, function () {
    var encryptedData$;
    return __generator(this, function (_a) {
        encryptedData$ = new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, exports.getOptionsPublicKey)(data, publicKeys).then(function (options) {
                        //
                        try {
                            //
                            openpgp.encrypt(options).then(function (ciphertext) {
                                // console.log('ciphertext',ciphertext);
                                var encrypted = ciphertext;
                                resolve({
                                    code: 1,
                                    encrypted: encrypted
                                });
                            });
                        }
                        catch (error) {
                            console.log({ error: error });
                            reject({
                                code: 0,
                                error: error
                            });
                        }
                    })];
            });
        }); });
        // console.log('encryptedData$', encryptedData$);
        return [2 /*return*/, encryptedData$];
    });
}); };
exports.encryptDatawithPGP = encryptDatawithPGP;
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
var signMessage = function (_a) {
    var pvkey = _a.pvkey, challenge = _a.challenge;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                    var privateKey, cleartextMessage, _a, _b, error_1;
                    var _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _d.trys.push([0, 4, , 5]);
                                console.log('signMessage', { pvkey: pvkey, challenge: challenge });
                                challenge = JSON.stringify(challenge);
                                return [4 /*yield*/, openpgp.readKey({ armoredKey: pvkey })];
                            case 1:
                                privateKey = _d.sent();
                                _b = (_a = openpgp).sign;
                                _c = {};
                                return [4 /*yield*/, openpgp.createCleartextMessage({ text: challenge })];
                            case 2: return [4 /*yield*/, _b.apply(_a, [(_c.message = _d.sent(),
                                        _c.signingKeys = [privateKey],
                                        _c.detached = false,
                                        _c)])];
                            case 3:
                                cleartextMessage = _d.sent();
                                console.log(cleartextMessage);
                                resolve({ status: 1, signature: cleartextMessage });
                                return [3 /*break*/, 5];
                            case 4:
                                error_1 = _d.sent();
                                console.log('there was an werror', error_1);
                                resolve({ status: 0, error: error_1 });
                                return [3 /*break*/, 5];
                            case 5: return [2 /*return*/];
                        }
                    });
                }); })
                // await privateKey.decrypt(passphrase);
            ];
        });
    });
};
exports.signMessage = signMessage;
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
var decryptDataWithPGP = function (data, pvkey) { return __awaiter(void 0, void 0, void 0, function () {
    var message, privateKey, decrypted, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, openpgp.readMessage({
                        armoredMessage: data // parse armored message
                    })];
            case 1:
                message = _a.sent();
                return [4 /*yield*/, openpgp.readKey({ armoredKey: pvkey })];
            case 2:
                privateKey = _a.sent();
                return [4 /*yield*/, openpgp.decrypt({
                        message: message,
                        decryptionKeys: [privateKey] // for decryption
                    })];
            case 3:
                decrypted = _a.sent();
                if (decrypted.data) {
                    return [2 /*return*/, decrypted];
                }
                else {
                    console.log('some erro');
                }
                return [3 /*break*/, 5];
            case 4:
                error_2 = _a.sent();
                console.log('some erro occured while decrypting');
                console.log(error_2);
                return [2 /*return*/, { data: data }];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.decryptDataWithPGP = decryptDataWithPGP;
var pgpEncryptObject = function (_a) {
    var data = _a.data, publicKeys = _a.publicKeys;
    return __awaiter(void 0, void 0, void 0, function () {
        var resp;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            resolve(Object.keys(data).reduce(function (prev, element) { return __awaiter(void 0, void 0, void 0, function () {
                                var returnVal, _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0: return [4 /*yield*/, prev];
                                        case 1:
                                            returnVal = _c.sent();
                                            _a = returnVal;
                                            _b = element;
                                            return [4 /*yield*/, (0, exports.pgpEncryptSingleField)(data[element], publicKeys)];
                                        case 2:
                                            _a[_b] = _c.sent();
                                            return [2 /*return*/, returnVal];
                                    }
                                });
                            }); }, Promise.resolve({})));
                            return [2 /*return*/];
                        });
                    }); })];
                case 1:
                    resp = _b.sent();
                    return [2 /*return*/, resp];
            }
        });
    });
};
exports.pgpEncryptObject = pgpEncryptObject;
var pgpEncryptSingleField = function (element, publicKeys) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var encdata;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, (0, exports.encryptDatawithPGP)(element, publicKeys)];
                        case 1:
                            encdata = _a.sent();
                            resolve(encdata.encrypted);
                            return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
exports.pgpEncryptSingleField = pgpEncryptSingleField;
var pgpEncryptSingleFieldIPC = function (_a) {
    var element = _a.element, publicKeys = _a.publicKeys;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                    var encdata;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, (0, exports.encryptDatawithPGP)(element, publicKeys)];
                            case 1:
                                encdata = _a.sent();
                                resolve(encdata.encrypted);
                                return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
};
exports.pgpEncryptSingleFieldIPC = pgpEncryptSingleFieldIPC;
var pgpDecryptObject = function (data, privateKey) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    resolve(Object.keys(data).reduce(function (prev, element) { return __awaiter(void 0, void 0, void 0, function () {
                        var returnVal, _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, prev];
                                case 1:
                                    returnVal = _c.sent();
                                    _a = returnVal;
                                    _b = element;
                                    return [4 /*yield*/, (0, exports.pgpDecryptSingleField)(data[element], privateKey)];
                                case 2:
                                    _a[_b] = _c.sent();
                                    return [2 /*return*/, returnVal];
                            }
                        });
                    }); }, Promise.resolve({})));
                    return [2 /*return*/];
                });
            }); })];
    });
}); };
exports.pgpDecryptObject = pgpDecryptObject;
var pgpDecryptObjectIPC = function (_a) {
    var data = _a.data, privateKey = _a.privateKey;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        resolve(Object.keys(data).reduce(function (prev, element) { return __awaiter(void 0, void 0, void 0, function () {
                            var returnVal, _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0: return [4 /*yield*/, prev];
                                    case 1:
                                        returnVal = _c.sent();
                                        _a = returnVal;
                                        _b = element;
                                        return [4 /*yield*/, (0, exports.pgpDecryptSingleField)(data[element], privateKey)];
                                    case 2:
                                        _a[_b] = _c.sent();
                                        return [2 /*return*/, returnVal];
                                }
                            });
                        }); }, Promise.resolve({})));
                        return [2 /*return*/];
                    });
                }); })];
        });
    });
};
exports.pgpDecryptObjectIPC = pgpDecryptObjectIPC;
var pgpDecryptSingleField = function (element, privateKey) {
    return new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
        var decData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, exports.decryptDataWithPGP)(element, privateKey)];
                case 1:
                    decData = _a.sent();
                    resolve(decData.decrypted ? decData.decrypted.data : decData.data);
                    return [2 /*return*/];
            }
        });
    }); });
};
exports.pgpDecryptSingleField = pgpDecryptSingleField;
var aesdecryptSingleField = function (data, password) {
    try {
        return CryptoJS.AES.decrypt(data.toString(), password.toString('utf8')).toString(CryptoJS.enc.Utf8);
    }
    catch (error) {
        return 'ERROR';
    }
};
exports.aesdecryptSingleField = aesdecryptSingleField;
var AESDecryptObject = function (data, password) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    resolve(Object.keys(data).reduce(function (prev, element) { return __awaiter(void 0, void 0, void 0, function () {
                        var returnVal, _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, prev];
                                case 1:
                                    returnVal = _c.sent();
                                    _a = returnVal;
                                    _b = element;
                                    return [4 /*yield*/, (0, exports.aesdecryptSingleField)(data[element], password)];
                                case 2:
                                    _a[_b] = _c.sent();
                                    return [2 /*return*/, returnVal];
                            }
                        });
                    }); }, Promise.resolve({})));
                    return [2 /*return*/];
                });
            }); })];
    });
}); };
exports.AESDecryptObject = AESDecryptObject;
var AESDecryptObjectIPC = function (_a) {
    var data = _a.data, password = _a.password;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        try {
                            resolve(Object.keys(data).reduce(function (prev, element) { return __awaiter(void 0, void 0, void 0, function () {
                                var returnVal, _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0: return [4 /*yield*/, prev];
                                        case 1:
                                            returnVal = _c.sent();
                                            _a = returnVal;
                                            _b = element;
                                            return [4 /*yield*/, (0, exports.aesdecryptSingleField)(data[element], password)];
                                        case 2:
                                            _a[_b] = _c.sent();
                                            console.log(returnVal[element]);
                                            return [2 /*return*/, returnVal];
                                    }
                                });
                            }); }, Promise.resolve({})));
                        }
                        catch (error) {
                            console.log('AESDecryptObjectIPC', { error: error });
                            reject(1);
                        }
                        return [2 /*return*/];
                    });
                }); })];
        });
    });
};
exports.AESDecryptObjectIPC = AESDecryptObjectIPC;
//# sourceMappingURL=ssidOperations.js.map