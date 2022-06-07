import { Injectable } from '@angular/core';
import * as forge from 'node-forge';


@Injectable({
  providedIn: 'root'
})
export class HashFileService {

  constructor() { }

  getFileReader(): FileReader {
    const fileReader = new FileReader();
    const zoneOriginalInstance = (fileReader as any)["__zone_symbol__originalInstance"];
    return zoneOriginalInstance || fileReader;
  }

  hashFile(file) {
    console.log('hashing');
    console.log(file);
    const SHA256 = forge.md.sha384.create();
    var self = this;
    return new Promise((resolve, reject) => {
      var fileSize   = file.size;
      var chunkSize  = 64 * 1024; // bytes
      var offset     = 0;
      var chunkReaderBlock = null;

      var readEventHandler = function(evt) {
          if (evt.target.error == null) {
            
              offset += evt.target.result.length;
              SHA256.update(evt.target.result); // callback for handling read chunk
          } else {
              console.log("Read error: " + evt.target.error);
              reject ({
                code: 0,
                error: evt.target.error
              })
              return;
          }
          if (offset >= fileSize) {
              console.log("Done reading file");
              const hash = SHA256.digest().toHex();
              resolve ({
                code: 1,
                hash
              })
              return;
          }

          // of to the next chunk
          chunkReaderBlock(offset, chunkSize, file);
      }

      chunkReaderBlock = function(_offset, length, _file) {
          var r = self.getFileReader();
          var blob = _file.slice(_offset, length + _offset);
          r.onload = readEventHandler;
          r.readAsBinaryString(blob);
      }

      // now let's start the read with the first block
      chunkReaderBlock(offset, chunkSize, file);
    })
  }
}
