import { download } from 'electron-dl'
import { app, BrowserWindow, ipcMain, Notification } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import * as FormData from 'form-data';
import * as forge from 'node-forge';
import { v4 as uuid } from 'uuid';
var shell = require('electron').shell;
const dv2Url = 'https://standardized.theotherfruit.io/api/datacenter';

export const generateUUID = async () => {
    return new Promise((resolve, reject) => {
        try {
           
            resolve(uuid());
        } catch (error) {
            reject(error);
        }
    })
};

export const getCurrentPath = async () => {
    return new Promise((resolve, reject) => {
        try {
            // TODO: use this in production
            const currentPath = path.join(app.getAppPath(), '../..')
            // const currentPath = path.join(app.getAppPath())
            resolve(currentPath);
        } catch (error) {
            console.log('Error getCurrentPath');
            reject(error);
        }
    })
};

export const bulkWriteLocalstorage = async (data) => {
    return new Promise((resolve, reject) => {
        try {
            const { userName, email, keys } = data;
            console.log(userName, email, keys);
            const filePath = 'Aerie-' + userName + '-' + email + '.key';
            fs.writeFileSync(path.join(app.getPath('appData'), filePath), JSON.stringify(keys), { encoding: 'utf-8', flag: 'w+' });
            fs.writeFileSync(path.join(app.getPath('documents'), filePath), JSON.stringify(keys), { encoding: 'utf-8', flag: 'w+' });
            new Notification({ title: 'Key file updated', body: 'You will find your updated keyfile in Documents folder' }).show()

        } catch (error) {
            console.log(error);
            new Notification({ title: 'Error updating key file', body: error }).show()
            reject(error)
        }
    })
}

export const syncKeyFile = async (data) => {
    const { userName, email, key } = data;
    console.log(userName, email, key);

    return new Promise((resolve, reject) => {
        try {
            const filePath = 'Aerie-' + userName + '-' + email + '.key';
            const existsInAD = fs.existsSync(path.join(app.getPath('appData'), filePath));
            const existsInDoc = fs.existsSync(path.join(app.getPath('documents'), filePath));
            if (existsInAD || existsInDoc) {
                const res = fs.readFileSync(path.join(app.getPath('appData'), filePath) || path.join(app.getPath('documents'), filePath), { encoding: 'utf-8' });
                const keys = JSON.parse(res);
                keys[key.key] = key.value;
                fs.writeFileSync(path.join(app.getPath('appData'), filePath), JSON.stringify(keys), { encoding: 'utf-8', flag: 'w+' });
                fs.writeFileSync(path.join(app.getPath('documents'), filePath), JSON.stringify(keys), { encoding: 'utf-8', flag: 'w+' });
                new Notification({ title: 'Key file updated', body: 'You will find your updated keyfile in Documents folder' }).show()
                resolve(true)
            } else {
                const keys = {};
                keys[key.key] = key.value;
                fs.writeFileSync(path.join(app.getPath('appData'), filePath), JSON.stringify(keys), { encoding: 'utf-8', flag: 'w+' });
                fs.writeFileSync(path.join(app.getPath('documents'), filePath), JSON.stringify(keys), { encoding: 'utf-8', flag: 'w+' });
                new Notification({ title: 'Key file updated', body: 'You will find your updated keyfile in Documents folder' }).show()
                resolve(true)
            }
        } catch (error) {
            console.log(error);

            new Notification({ title: 'Error updating key file', body: error }).show()
            reject(error)
        }
    })
}

export const checkFileExistsInAppDir = async (data) => {
    return new Promise((resolve, reject) => {
        try {
            const { name } = data;
            // TODO: use this in production
            // const currentPath = path.join(app.getAppPath(), '../..')
            const exists = fs.existsSync(path.join(app.getAppPath(), name));
            resolve(exists);
        } catch (error) {
            console.log('Error checkFileExists');
            reject(error);
        }
    })
};

export const deleteFileInAppDir = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { name } = data.data;
            const exists = fs.existsSync(name);
            if (exists) {
                var unlink = await fs.unlinkSync(name)
            }
            const response = { message: 'Sucessfully deleted', code: 1 }
            resolve(response);
        } catch (error) {
            console.log('Error checkFileExists');
            reject(error);
        }
    })
};

let progressObject = {};
ipcMain.on('DOWNLOAD_STATUS', async (event, args) => {
    event.reply('DOWNLOAD_STATUS_RESP', { progressObject });
});
export const downloadFile = async (data) => {
    return new Promise((resolve, reject) => {
        try {
            const { url, appDir } = data;
            const win = BrowserWindow.getAllWindows()[0];
            const directory = appDir == true ? path.join(app.getPath('appData'), 'Volary') : app.getPath('downloads')
            const onCompleted = async (d) => {
                console.log(d);
                // ipcMain.removeAllListeners('DOWNLOAD_STATUS')
                resolve({
                    data: d,
                    code: 1
                });
            }
            const onProgress = async (progress) => {
                console.log(progress);
                progressObject = { progress, data };
            }
            download(win, url, { directory, onCompleted, onProgress, overwrite: true })
        } catch (error) {
            console.log('Error downloadFile');
            reject({
                code: 0,
                error
            });
        }
    })
};

export const downloadFileInAppDirectory = async (data) => {
    console.log({ data });

    return new Promise(async (resolve, reject) => {
        try {
            const { url, id, name } = data;
            const win = BrowserWindow.getFocusedWindow();
            const location = path.join(app.getAppPath(), 'temp');
            console.log({ location });

            const onCompleted = async (d) => {
                console.log('downloadFileInAppDirectory', d);
                resolve({
                    data: d,
                    code: 1
                });
            }
            const onProgress = async (data) => {
                console.log(data);
            }
            // const delFile = await deleteFileInAppDir({ name })
            download(win, url, { directory: location, onCompleted, overwrite: true, onProgress, filename: name + `_${uuid()}` + '.jpg' });
        } catch (error) {
            console.log('Error startBlockchainNode', { error });
            resolve({
                code: 0,
                error
            });
        }
    })
};
function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const getNFTMetadata = async ({ url }) => {
    return new Promise(async (resolve, reject) => {
        await delay(1000);

        try {
            const res = await axios.get(url)
            console.log(res.status);
            resolve(res.data);
        } catch (error) {

            if (error.response.status === 429) {
                await delay(5000);

                const res = await axios.get(url)
                console.log(res.status);
                resolve(res.data);
            }

        }


    })

}

export const uploadFile = async ({ filePath, toSTORJ }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (toSTORJ) {
                var data = new FormData();
                data.append('files', fs.createReadStream(filePath));
                axios({
                    method: 'post',
                    url: 'https://1st-digital-sportal-backend.theotherfruit.io/blockchain-stack/ava/uploadfile',
                    headers: {
                        ...data.getHeaders()
                    },
                    data
                })
                    .then(function (response) {
                        resolve(response.data);
                    })
                    .catch(function (error) {
                        resolve(error);
                    });
            } else {
                const result = await axios.post(dv2Url + '/authenticate');

                const auth = result.data;
                var data = new FormData();
                data.append('file', fs.createReadStream(filePath));
                data.append('fileName', path.basename(filePath));
                data.append("publicKey", auth.publicKey);
                data.append("signature", auth.authParams.signature);
                data.append("expire", auth.authParams.expire);
                data.append("token", auth.authParams.token);
                const fileUpload = await axios({
                    method: 'post',
                    url: 'https://upload.imagekit.io/api/v1/files/upload',
                    headers: {
                        ...data.getHeaders()
                    },
                    data
                })
                console.log({ fileUpload });

                resolve(fileUpload.data)
            }

        } catch (error) {
            console.log('Error uploadFile', error);
            resolve(error);
        }
    })
};




export const hashFile = ({ path }) => {
    console.log('hashFile ', { path });
    const SHA256 = forge.md.sha384.create();
    return new Promise((resolve, reject) => {
        const file: any = fs.createReadStream(path);
        let hash = SHA256.update(file);
        hash = hash.digest().toHex()
        console.log(hash); // the desired sha1sum
        resolve({
            code: 1,
            hash
        })
    })
}

export const openInBrowser = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { link } = data.data;
            if (!['https:', 'http'].includes(new URL(link).protocol)) {
                const resp = { message: 'Failed', code: 0 }
                resolve(resp);
            }
            else {
                shell.openExternal(link);
                const resp = { message: 'Sucess to open', code: 1 }
                resolve(resp);
            }

        } catch (error) {
            console.log('Error checkFileExists');
            reject(error);
        }
    })
};