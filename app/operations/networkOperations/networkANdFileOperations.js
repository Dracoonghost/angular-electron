"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.openInBrowser = exports.hashFile = exports.uploadFile = exports.getNFTMetadata = exports.downloadFileInAppDirectory = exports.downloadFile = exports.deleteFileInAppDir = exports.checkFileExistsInAppDir = exports.syncKeyFile = exports.bulkWriteLocalstorage = exports.getCurrentPath = exports.generateUUID = void 0;
var electron_dl_1 = require("electron-dl");
var electron_1 = require("electron");
var path = require("path");
var fs = require("fs");
var axios_1 = require("axios");
var FormData = require("form-data");
var forge = require("node-forge");
var uuid_1 = require("uuid");
var shell = require('electron').shell;
var dv2Url = 'https://standardized.theotherfruit.io/api/datacenter';
var generateUUID = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                try {
                    resolve((0, uuid_1.v4)());
                }
                catch (error) {
                    reject(error);
                }
            })];
    });
}); };
exports.generateUUID = generateUUID;
var getCurrentPath = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                try {
                    // TODO: use this in production
                    var currentPath = path.join(electron_1.app.getAppPath(), '../..');
                    // const currentPath = path.join(app.getAppPath())
                    resolve(currentPath);
                }
                catch (error) {
                    console.log('Error getCurrentPath');
                    reject(error);
                }
            })];
    });
}); };
exports.getCurrentPath = getCurrentPath;
var bulkWriteLocalstorage = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                try {
                    var userName = data.userName, email = data.email, keys = data.keys;
                    console.log(userName, email, keys);
                    var filePath = 'Aerie-' + userName + '-' + email + '.key';
                    fs.writeFileSync(path.join(electron_1.app.getPath('appData'), filePath), JSON.stringify(keys), { encoding: 'utf-8', flag: 'w+' });
                    fs.writeFileSync(path.join(electron_1.app.getPath('documents'), filePath), JSON.stringify(keys), { encoding: 'utf-8', flag: 'w+' });
                    new electron_1.Notification({ title: 'Key file updated', body: 'You will find your updated keyfile in Documents folder' }).show();
                }
                catch (error) {
                    console.log(error);
                    new electron_1.Notification({ title: 'Error updating key file', body: error }).show();
                    reject(error);
                }
            })];
    });
}); };
exports.bulkWriteLocalstorage = bulkWriteLocalstorage;
var syncKeyFile = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var userName, email, key;
    return __generator(this, function (_a) {
        userName = data.userName, email = data.email, key = data.key;
        console.log(userName, email, key);
        return [2 /*return*/, new Promise(function (resolve, reject) {
                try {
                    var filePath = 'Aerie-' + userName + '-' + email + '.key';
                    var existsInAD = fs.existsSync(path.join(electron_1.app.getPath('appData'), filePath));
                    var existsInDoc = fs.existsSync(path.join(electron_1.app.getPath('documents'), filePath));
                    if (existsInAD || existsInDoc) {
                        var res = fs.readFileSync(path.join(electron_1.app.getPath('appData'), filePath) || path.join(electron_1.app.getPath('documents'), filePath), { encoding: 'utf-8' });
                        var keys = JSON.parse(res);
                        keys[key.key] = key.value;
                        fs.writeFileSync(path.join(electron_1.app.getPath('appData'), filePath), JSON.stringify(keys), { encoding: 'utf-8', flag: 'w+' });
                        fs.writeFileSync(path.join(electron_1.app.getPath('documents'), filePath), JSON.stringify(keys), { encoding: 'utf-8', flag: 'w+' });
                        new electron_1.Notification({ title: 'Key file updated', body: 'You will find your updated keyfile in Documents folder' }).show();
                        resolve(true);
                    }
                    else {
                        var keys = {};
                        keys[key.key] = key.value;
                        fs.writeFileSync(path.join(electron_1.app.getPath('appData'), filePath), JSON.stringify(keys), { encoding: 'utf-8', flag: 'w+' });
                        fs.writeFileSync(path.join(electron_1.app.getPath('documents'), filePath), JSON.stringify(keys), { encoding: 'utf-8', flag: 'w+' });
                        new electron_1.Notification({ title: 'Key file updated', body: 'You will find your updated keyfile in Documents folder' }).show();
                        resolve(true);
                    }
                }
                catch (error) {
                    console.log(error);
                    new electron_1.Notification({ title: 'Error updating key file', body: error }).show();
                    reject(error);
                }
            })];
    });
}); };
exports.syncKeyFile = syncKeyFile;
var checkFileExistsInAppDir = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                try {
                    var name_1 = data.name;
                    // TODO: use this in production
                    // const currentPath = path.join(app.getAppPath(), '../..')
                    var exists = fs.existsSync(path.join(electron_1.app.getAppPath(), name_1));
                    resolve(exists);
                }
                catch (error) {
                    console.log('Error checkFileExists');
                    reject(error);
                }
            })];
    });
}); };
exports.checkFileExistsInAppDir = checkFileExistsInAppDir;
var deleteFileInAppDir = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var name_2, exists, unlink, response, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            name_2 = data.data.name;
                            exists = fs.existsSync(name_2);
                            if (!exists) return [3 /*break*/, 2];
                            return [4 /*yield*/, fs.unlinkSync(name_2)];
                        case 1:
                            unlink = _a.sent();
                            _a.label = 2;
                        case 2:
                            response = { message: 'Sucessfully deleted', code: 1 };
                            resolve(response);
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            console.log('Error checkFileExists');
                            reject(error_1);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
exports.deleteFileInAppDir = deleteFileInAppDir;
var progressObject = {};
electron_1.ipcMain.on('DOWNLOAD_STATUS', function (event, args) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        event.reply('DOWNLOAD_STATUS_RESP', { progressObject: progressObject });
        return [2 /*return*/];
    });
}); });
var downloadFile = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                try {
                    var url = data.url, appDir = data.appDir;
                    var win = electron_1.BrowserWindow.getAllWindows()[0];
                    var directory = appDir == true ? path.join(electron_1.app.getPath('appData'), 'Volary') : electron_1.app.getPath('downloads');
                    var onCompleted = function (d) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            console.log(d);
                            // ipcMain.removeAllListeners('DOWNLOAD_STATUS')
                            resolve({
                                data: d,
                                code: 1
                            });
                            return [2 /*return*/];
                        });
                    }); };
                    var onProgress = function (progress) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            console.log(progress);
                            progressObject = { progress: progress, data: data };
                            return [2 /*return*/];
                        });
                    }); };
                    (0, electron_dl_1.download)(win, url, { directory: directory, onCompleted: onCompleted, onProgress: onProgress, overwrite: true });
                }
                catch (error) {
                    console.log('Error downloadFile');
                    reject({
                        code: 0,
                        error: error
                    });
                }
            })];
    });
}); };
exports.downloadFile = downloadFile;
var downloadFileInAppDirectory = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log({ data: data });
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var url, id, name_3, win, location_1, onCompleted, onProgress;
                return __generator(this, function (_a) {
                    try {
                        url = data.url, id = data.id, name_3 = data.name;
                        win = electron_1.BrowserWindow.getFocusedWindow();
                        location_1 = path.join(electron_1.app.getAppPath(), 'temp');
                        console.log({ location: location_1 });
                        onCompleted = function (d) { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                console.log('downloadFileInAppDirectory', d);
                                resolve({
                                    data: d,
                                    code: 1
                                });
                                return [2 /*return*/];
                            });
                        }); };
                        onProgress = function (data) { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                console.log(data);
                                return [2 /*return*/];
                            });
                        }); };
                        // const delFile = await deleteFileInAppDir({ name })
                        (0, electron_dl_1.download)(win, url, { directory: location_1, onCompleted: onCompleted, overwrite: true, onProgress: onProgress, filename: name_3 + "_".concat((0, uuid_1.v4)()) + '.jpg' });
                    }
                    catch (error) {
                        console.log('Error startBlockchainNode', { error: error });
                        resolve({
                            code: 0,
                            error: error
                        });
                    }
                    return [2 /*return*/];
                });
            }); })];
    });
}); };
exports.downloadFileInAppDirectory = downloadFileInAppDirectory;
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
var getNFTMetadata = function (_a) {
    var url = _a.url;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                    var res, error_2, res;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, delay(1000)];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2:
                                _a.trys.push([2, 4, , 8]);
                                return [4 /*yield*/, axios_1.default.get(url)];
                            case 3:
                                res = _a.sent();
                                console.log(res.status);
                                resolve(res.data);
                                return [3 /*break*/, 8];
                            case 4:
                                error_2 = _a.sent();
                                if (!(error_2.response.status === 429)) return [3 /*break*/, 7];
                                return [4 /*yield*/, delay(5000)];
                            case 5:
                                _a.sent();
                                return [4 /*yield*/, axios_1.default.get(url)];
                            case 6:
                                res = _a.sent();
                                console.log(res.status);
                                resolve(res.data);
                                _a.label = 7;
                            case 7: return [3 /*break*/, 8];
                            case 8: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
};
exports.getNFTMetadata = getNFTMetadata;
var uploadFile = function (_a) {
    var filePath = _a.filePath, toSTORJ = _a.toSTORJ;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                    var data, result, auth, data, fileUpload, error_3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 5, , 6]);
                                if (!toSTORJ) return [3 /*break*/, 1];
                                data = new FormData();
                                data.append('files', fs.createReadStream(filePath));
                                (0, axios_1.default)({
                                    method: 'post',
                                    url: 'https://1st-digital-sportal-backend.theotherfruit.io/blockchain-stack/ava/uploadfile',
                                    headers: __assign({}, data.getHeaders()),
                                    data: data
                                })
                                    .then(function (response) {
                                    resolve(response.data);
                                })
                                    .catch(function (error) {
                                    resolve(error);
                                });
                                return [3 /*break*/, 4];
                            case 1: return [4 /*yield*/, axios_1.default.post(dv2Url + '/authenticate')];
                            case 2:
                                result = _a.sent();
                                auth = result.data;
                                data = new FormData();
                                data.append('file', fs.createReadStream(filePath));
                                data.append('fileName', path.basename(filePath));
                                data.append("publicKey", auth.publicKey);
                                data.append("signature", auth.authParams.signature);
                                data.append("expire", auth.authParams.expire);
                                data.append("token", auth.authParams.token);
                                return [4 /*yield*/, (0, axios_1.default)({
                                        method: 'post',
                                        url: 'https://upload.imagekit.io/api/v1/files/upload',
                                        headers: __assign({}, data.getHeaders()),
                                        data: data
                                    })];
                            case 3:
                                fileUpload = _a.sent();
                                console.log({ fileUpload: fileUpload });
                                resolve(fileUpload.data);
                                _a.label = 4;
                            case 4: return [3 /*break*/, 6];
                            case 5:
                                error_3 = _a.sent();
                                console.log('Error uploadFile', error_3);
                                resolve(error_3);
                                return [3 /*break*/, 6];
                            case 6: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
};
exports.uploadFile = uploadFile;
var hashFile = function (_a) {
    var path = _a.path;
    console.log('hashFile ', { path: path });
    var SHA256 = forge.md.sha384.create();
    return new Promise(function (resolve, reject) {
        var file = fs.createReadStream(path);
        var hash = SHA256.update(file);
        hash = hash.digest().toHex();
        console.log(hash); // the desired sha1sum
        resolve({
            code: 1,
            hash: hash
        });
    });
};
exports.hashFile = hashFile;
var openInBrowser = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                var link, resp, resp;
                return __generator(this, function (_a) {
                    try {
                        link = data.data.link;
                        if (!['https:', 'http'].includes(new URL(link).protocol)) {
                            resp = { message: 'Failed', code: 0 };
                            resolve(resp);
                        }
                        else {
                            shell.openExternal(link);
                            resp = { message: 'Sucess to open', code: 1 };
                            resolve(resp);
                        }
                    }
                    catch (error) {
                        console.log('Error checkFileExists');
                        reject(error);
                    }
                    return [2 /*return*/];
                });
            }); })];
    });
}); };
exports.openInBrowser = openInBrowser;
//# sourceMappingURL=networkANdFileOperations.js.map