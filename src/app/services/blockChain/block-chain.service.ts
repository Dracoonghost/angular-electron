/* eslint-disable @typescript-eslint/naming-convention */

import { ipcRenderer } from 'electron';
import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import axios from 'axios';
import { CommonService } from '../common/common.service';
import { ApiService } from '../apiServices/api.service';
import { APP_CONFIG } from '../../../environments/environment';
import { ToastrServiceService } from '../toastr/toastr-service.service';
import { SpinnerService } from '../spinner/spinner.service';
import { IntercomService } from '../intercom/intercom.service';
declare let Moralis: any;
declare let Web3: any;
declare let Caver: any;

@Injectable({
  providedIn: 'root'
})
export class BlockChainService {
  public network = APP_CONFIG.network;
  intercom: any;
  mittEmitter: any;
  private web3js: any;
  private provider: any;

  private rpcsAndContractAddress = {
    test: {
      ETH_API_URL: 'https://speedy-nodes-nyc.moralis.io/f0220fcafece331c97ad8548/eth/rinkeby',
      ETH_Contract: '0x869BA6b576D85FBB23210954ED19c8B773Ac6ad9',
      POLYGON_API_URL: 'https://speedy-nodes-nyc.moralis.io/f73460984efe542876c6773c/polygon/mumbai',
      POLYGON_Contract: '0x49b4B3A35e5603B4a6dB14aB2e3533299ed5abE5',
      AVA_API_URL: 'https://speedy-nodes-nyc.moralis.io/f73460984efe542876c6773c/avalanche/testnet',
      AVA_Contract: '0x869BA6b576D85FBB23210954ED19c8B773Ac6ad9',
      BSC_API_URL: 'https://speedy-nodes-nyc.moralis.io/f73460984efe542876c6773c/bsc/testnet',
      BSC_Contract: '0x869BA6b576D85FBB23210954ED19c8B773Ac6ad9',
      KLAYTN_API_URL: 'https://api.baobab.klaytn.net:8651/',
      KLAYTN_Contract: '0x869BA6b576D85FBB23210954ED19c8B773Ac6ad9',
    },
    main: {
      ETH_API_URL: 'https://speedy-nodes-nyc.moralis.io/f73460984efe542876c6773c/eth/mainnet',
      ETH_Contract: '0x869BA6b576D85FBB23210954ED19c8B773Ac6ad9',
      POLYGON_API_URL: 'https://polygon-rpc.com',
      POLYGON_Contract: '0x8d067AF328EF52C0dAC68fb206A07458A3b61808',
      AVA_API_URL: 'https://speedy-nodes-nyc.moralis.io/f73460984efe542876c6773c/avalanche/mainnet',
      AVA_Contract: '0x869BA6b576D85FBB23210954ED19c8B773Ac6ad9',
      BSC_API_URL: 'https://speedy-nodes-nyc.moralis.io/f73460984efe542876c6773c/bsc/mainnet',
      BSC_Contract: '0x869BA6b576D85FBB23210954ED19c8B773Ac6ad9',
      KLAYTN_API_URL: 'https://public-node-api.klaytnapi.com/v1/cypress',
      KLAYTN_Contract: '0x869BA6b576D85FBB23210954ED19c8B773Ac6ad9',
    }
  };

  private API_URL = {
    ETH: this.rpcsAndContractAddress[this.network].ETH_API_URL,
    ETH_Contract: this.rpcsAndContractAddress[this.network].ETH_Contract,
    POLYGON: this.rpcsAndContractAddress[this.network].POLYGON_API_URL,
    POLYGON_Contract: this.rpcsAndContractAddress[this.network].POLYGON_Contract,
    BSC: this.rpcsAndContractAddress[this.network].BSC_API_URL,
    BSC_Contract: this.rpcsAndContractAddress[this.network].BSC_Contract,
    AVA: this.rpcsAndContractAddress[this.network].AVA_API_URL,
    AVA_Contract: this.rpcsAndContractAddress[this.network].AVA_Contract,
    KLAYTN: this.rpcsAndContractAddress[this.network].KLAYTN_API_URL,
    KLAYTN_Contract: this.rpcsAndContractAddress[this.network].KLAYTN_Contract,
  };
  private API_URL_MINT;
  private contractAddress: any = '0x39fDcb1dCf9bed318466bcaB515815182925B22D';
  private appId: any = 'WBFjXOs9JXmKE7I9z6XUOuLXCx278PJCDPQsJB8W';
  private serverUrl: any = 'https://dwlcbizxcld7.usemoralis.com:2053/server';
  private chainId: any;
  private blockchain: any;
  private wallet: any;
  private Key: any;
  constructor(
    private API: ApiService,
    private common: CommonService,
    private toast: ToastrServiceService,
    private loader: SpinnerService,
    private icom: IntercomService,
  ) {
    this.intercom = icom.intercom;
    this.mittEmitter = this.icom.mittEmitter;
  }

  async importNFTKLAYTN(data) {
    console.log({ data });

    return new Promise(async (resolve, reject) => {
      try {
        const { tokenId, contractAddress, selectedWalletPrivateKey, contractType } = data;
        const caver = new Caver(this.API_URL.KLAYTN);
        const account = caver.klay.accounts.wallet.add(selectedWalletPrivateKey);
        await caver.wallet.newKeyring(account.address, selectedWalletPrivateKey);
        const stakingContractAddress = '0x869BA6b576D85FBB23210954ED19c8B773Ac6ad9';
        if (contractType === 'ERC721') {
          console.log({
            contractAddress,
            address: account.address,
            receiver: stakingContractAddress,
            tokenId,
          });

          const contract = caver.contract.create(
            this.common.erc721ABI,
            contractAddress
          );
          contract.options.from = account.address;
          console.log({ contractAddress, address: account.address, rpc: this.API_URL.KLAYTN });

          // transferNFT(address.address, stakingContractAddress, tokenId)
          const txn = await contract.methods
            .transferNFT(
              account.address,
              stakingContractAddress,
              tokenId,
            )
            .send({
              from: account.address,
              gas: 10000000,
            });
          resolve(txn);
        }


      } catch (error) {
        this.loader.hide();
        this.toast.show('error', error.message, error.message);
      }
    });
  };

  async transferNFTKLAYTN(data) {
    console.log({ data });

    return new Promise(async (resolve, reject) => {
      try {
        const { tokenId, contractAddress, selectedWalletPrivateKey, contractType, toAddress } = data;
        const caver = new Caver(this.API_URL.KLAYTN);
        const account = caver.klay.accounts.wallet.add(selectedWalletPrivateKey);
        await caver.wallet.newKeyring(account.address, selectedWalletPrivateKey);
        if (contractType === 'ERC721') {
          console.log({
            contractAddress,
            address: account.address,
            receiver: toAddress,
            tokenId,
          });

          const contract = caver.contract.create(
            this.common.erc721ABI,
            contractAddress
          );
          contract.options.from = account.address;
          console.log({ contractAddress, address: account.address, rpc: this.API_URL.KLAYTN });

          // transferNFT(address.address, stakingContractAddress, tokenId)
          const txn = await contract.methods
            .transferNFT(
              account.address,
              toAddress,
              tokenId,
            )
            .send({
              from: account.address,
              gas: 10000000,
            });
          resolve(txn);
        }


      } catch (error) {
        this.loader.hide();
        this.toast.show('error', error.message, error.message);
      }
    });
  };

  async raiseTicket(privateKey, ssid) {
    return new Promise(async (resolve, reject) => {
      const respEvent = await this.icom.processIPC('BLOCKCHAIN', 'raiseTicket', { privateKey, ssid });
      ipcRenderer.once(respEvent, (event, arg) => {
        console.log(arg.result);
        resolve(arg.result);
      });
    });
  }

  async updateWhiteListingAddresses(addresses, ssid, privateKey) {
    return new Promise(async (resolve, reject) => {
      const respEvent = await this.icom.processIPC('BLOCKCHAIN', 'updateWhiteListingAddresses', { addresses, ssid, privateKey });
      ipcRenderer.once(respEvent, (event, arg) => {
        console.log(event, arg);
        resolve(arg.result);
      });
    });
  }

  async signTicket(privateKey, txnNonce) {
    return new Promise(async (resolve, reject) => {
      const respEvent = await this.icom.processIPC('BLOCKCHAIN', 'signTicket', { privateKey, txnNonce });
      ipcRenderer.once(respEvent, (event, arg) => {
        console.log(arg);
        resolve(arg.result);
      });
    });
  }

  async importNFT(tokenId, contractAddress, selectedWalletPrivateKey, contractType, gas, blockchain) {
    console.log({ tokenId, contractAddress, selectedWalletPrivateKey, contractType, blockchain });

    if (blockchain === 'KLAYTN') {
      return this.importNFTKLAYTN({ tokenId, contractAddress, selectedWalletPrivateKey, contractType });
    }


    try {

      this.web3js = new Web3(new Web3.providers.HttpProvider(this.API_URL[blockchain]));
      const stakingContractAddress = blockchain === 'POLYGON' ?
        '0xd5b99504850c8ae329fff2b79825e93de7f7c229' :
        blockchain === 'ETH' ? '0x30f8051Cfda8AB5eA360cf0f04F279E4303147eb' : '0x869BA6b576D85FBB23210954ED19c8B773Ac6ad9';
      const address = await this.web3js.eth.accounts.privateKeyToAccount(selectedWalletPrivateKey);
      console.log({ API_URL: this.API_URL[blockchain], address });
      let myContract;
      let txs;
      if (contractType === 'ERC721') {
        console.log({
          abi: this.common.erc721ABI,
          contractAddress,
          address: address.address,
          receiver: stakingContractAddress,
          tokenId,
        });
        myContract = new this.web3js.eth.Contract(this.common.erc721ABI, contractAddress);
        txs = await myContract.methods.transferNFT(address.address, stakingContractAddress, tokenId);
      } else {
        console.log('ERC1155', address.address, stakingContractAddress, tokenId, 1, []);

        myContract = new this.web3js.eth.Contract(this.common.erc1155ABI, contractAddress);
        txs = await myContract.methods.safeTransferFrom(address.address, stakingContractAddress, tokenId, 1, []);
        console.log({ buHahaah: address.address, txs, selectedWalletPrivateKey });
      }
      const encodedData = await txs.encodeABI();
      console.log({ myContract });
      let tx;
      if (blockchain === 'POLYGON') {
        let maxFeePerGas = ethers.BigNumber.from(4800000000000); // fallback to 40 gwei
        let maxPriorityFeePerGas = ethers.BigNumber.from(4800000000000); // fallback to 40 gwei
        const { data } = await axios({
          method: 'get',
          url: 'https://gasstation-mainnet.matic.network/v2',
        });
        maxFeePerGas = ethers.utils.parseUnits(
          `${Math.ceil(data.fast.maxFee)}`,
          'gwei',
        );
        maxPriorityFeePerGas = ethers.utils.parseUnits(
          `${Math.ceil(data.fast.maxPriorityFee)}`,
          'gwei',
        );
        tx = {
          type: 2,
          from: address.address,
          to: contractAddress,
          gas: gas.estimate.charges.gasLimit || 200000,
          maxFeePerGas,
          maxPriorityFeePerGas,
          value: 0,
          data: encodedData
        };
      } else {
        tx = {
          type: 2,
          from: address.address,
          to: contractAddress,
          gas: gas.estimate.charges.gasLimit || 200000,
          value: 0,
          data: encodedData
        };
      }
      const signpromise = await this.web3js.eth.accounts.signTransaction(tx, selectedWalletPrivateKey);
      console.log({ signpromise });
      const senttx = await this.web3js.eth.sendSignedTransaction(signpromise.raw || signpromise.rawTransaction);
      console.log({ senttx });
      return senttx;
    } catch (error) {
      console.log({ error });

      console.log({ error: error.message });
      this.loader.hide();
      this.toast.show('error', error.message, error.message);
    }
  }

  async transferNFT(tokenId, contractAddress, selectedWalletPrivateKey, contractType, gas, blockchain, toAddress) {
    console.log({ tokenId, contractAddress, selectedWalletPrivateKey, contractType, blockchain });

    if (blockchain === 'KLAYTN') {
      return this.importNFTKLAYTN({ tokenId, contractAddress, selectedWalletPrivateKey, contractType, toAddress });
    }
    try {

      this.web3js = new Web3(new Web3.providers.HttpProvider(this.API_URL[blockchain]));
      const address = await this.web3js.eth.accounts.privateKeyToAccount(selectedWalletPrivateKey);
      console.log({ API_URL: this.API_URL[blockchain], address });
      let myContract;
      let txs;
      if (contractType === 'ERC721') {
        console.log({
          abi: this.common.erc721ABI,
          contractAddress,
          address: address.address,
          receiver: toAddress,
          tokenId,
        });
        myContract = new this.web3js.eth.Contract(this.common.erc721ABI, contractAddress);
        txs = await myContract.methods.transferNFT(address.address, toAddress, tokenId);
      } else {
        console.log('ERC1155', address.address, toAddress, tokenId, 1, []);

        myContract = new this.web3js.eth.Contract(this.common.erc1155ABI, contractAddress);
        txs = await myContract.methods.safeTransferFrom(address.address, toAddress, tokenId, 1, []);
        console.log({ buHahaah: address.address, txs, selectedWalletPrivateKey });
      }
      const encodedData = await txs.encodeABI();
      console.log({ myContract });
      let tx;
      if (blockchain === 'POLYGON') {
        let maxFeePerGas = ethers.BigNumber.from(4800000000000); // fallback to 40 gwei
        let maxPriorityFeePerGas = ethers.BigNumber.from(4800000000000); // fallback to 40 gwei
        const { data } = await axios({
          method: 'get',
          url: 'https://gasstation-mainnet.matic.network/v2',
        });
        maxFeePerGas = ethers.utils.parseUnits(
          `${Math.ceil(data.fast.maxFee)}`,
          'gwei',
        );
        maxPriorityFeePerGas = ethers.utils.parseUnits(
          `${Math.ceil(data.fast.maxPriorityFee)}`,
          'gwei',
        );
        tx = {
          type: 2,
          from: address.address,
          to: contractAddress,
          gas: gas.estimate.charges.gasLimit || 200000,
          maxFeePerGas,
          maxPriorityFeePerGas,
          value: 0,
          data: encodedData
        };
      } else {
        tx = {
          type: 2,
          from: address.address,
          to: contractAddress,
          gas: 250000,
          value: 0,
          data: encodedData
        };
      }
      const signpromise = await this.web3js.eth.accounts.signTransaction(tx, selectedWalletPrivateKey);
      console.log({ signpromise });
      const senttx = await this.web3js.eth.sendSignedTransaction(signpromise.raw || signpromise.rawTransaction);
      console.log({ senttx });
      return senttx;
    } catch (error) {
      console.log({ error });

      console.log({ error: error.message });
      this.loader.hide();
      this.toast.show('error', error.message, error.message);
    }
  }

  importNFTMetaMask(tokenId, contractAddress, selectedWalletPrivateKey, contractType) {
    return new Promise(async (resolve, reject) => {
      try {
        this.web3js = new Web3(new Web3.providers.HttpProvider(this.API_URL));
        await Moralis.enableWeb3();
        const tofAddress = '0x3D5Cc05B5419CcD3c1bD510ab026C76F42D20871';
        const erc1155Options = {
          chain: 'rinkeby', //bsc
          type: 'erc1155',
          receiver: tofAddress,
          tokenId,
          amount: 1,
          contractAddress,
        };
        const erc721Options = {
          chain: 'rinkeby',
          type: 'erc721',
          receiver: tofAddress,
          tokenId,
          contractAddress,
        };
        const nftOptions = contractType === 'ERC1155' ? erc1155Options : erc721Options;

        console.log({ nftOptions, tokenId, contractAddress, API_URL: this.API_URL });
        let result = await Moralis.transfer(nftOptions);
        result = await result.wait();
        console.log({ result });
        resolve({
          data: result,
          code: 1
        });
      } catch (error) {
        console.log({ error });
        reject({
          code: 0,
          error
        });
      }
    });

  }


  signature(tokenURI, Key) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('>>>>', tokenURI, '>>>>>>', Key);

        const selectType = await this.getSelectedBlockchain();
        console.log({ api: this.API_URL_MINT, contractadrress: this.contractAddress, blockchain: this.blockchain, chain: this.chainId });
        this.web3js = new Web3(new Web3.providers.HttpProvider(this.API_URL_MINT));
        const abi: any = this.common.erc721ABI;
        const wallet = new ethers.Wallet(Key, this.provider);
        const contract = new this.web3js.eth.Contract(abi, this.contractAddress);

        const address = await this.web3js.eth.accounts.privateKeyToAccount(Key);
        const tokenID = await this.createTokenId(address.address, contract);

        console.log({ contract: this.contractAddress, address: address.address, tokenID, blockchain: this.blockchain });
        // const tx = await contract.methods.mintNFT(address.address, tokenURI, tokenID);
        // const data = tx.encodeABI();
        // const gasLimit = await tx.estimateGas({from: address.address});
        // console.log(address.address, tokenURI, tokenID, this.blockchain);

        // // const gasLimit = await contract.methods.mintNFT(address.address, tokenURI, tokenID).estimateGas();
        // let gasPrice = await this.web3js.eth.getGasPrice();
        // gasPrice = this.web3js.utils.numberToHex(gasPrice);
        // const nonce = await this.web3js.eth.getTransactionCount(address.address);
        // console.log({nonce, address: address.address});

        // const transactionRequest = {
        //   from: address.address,
        //   to: this.contractAddress,
        //   nonce,
        //   data,
        //   gasLimit,
        //   gasPrice,
        //   chainId: this.chainId
        // }
        // console.log({transactionRequest});
        // const signedTx = await wallet.signTransaction(transactionRequest);
        // console.log(signedTx);

        //return { signedTx, blockchain: this.blockchain, tokenID }
        resolve({
          address: address.address, tokenURI, tokenID, blockchain: this.blockchain
        });
      } catch (error) {
        console.log({ error });
        resolve({
          code: 0,
          error
        });
      }
    });
  }



  walletProvider(key) {
    return new Promise(async (resolve, reject) => {
      try {
        const wallet = new ethers.Wallet(key);
        this.common.importedNFTS = [];
        //this.loader.showLoader('Fetching NFTS', 'FetchingPrivateNFTS')
        const NFTSArray: any = await this.API.getNFTSFromRinkeby({ address: wallet.address }).toPromise();
        console.log(NFTSArray);
        if (NFTSArray.status === 1) {
          this.common.importedNFTS = NFTSArray.result;
        }
        resolve({
          data: NFTSArray,
          code: 1
        });
      } catch (error) {
        console.log(error);
        reject({
          code: 0,
          error
        });
        // const toast = await this.toast.create({
        //   message : 'Error in Private Key',
        //   duration: 2000,
        //   color: "danger"
        // });
        // toast.present();
        //this.loader.hideLoader('FetchingPrivateNFTS')

      }
    });
  }

  async waitForOneSecond() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('I promise to return after one second!');
      }, 3000);
    });
  }

  async getNFTImported(data) {
    //let nft = await this.API.getRinkeby(data.token_id, data.token_address).toPromise()
    //return nft
  }

  async getAddress(key) {
    const address = await this.web3js.eth.accounts.privateKeyToAccount(key);
    return address;
  }


  async getSelectedBlockchain() {
    const key = this.common.selectedWalletType ? this.common.selectedWalletType : 'BNB';
    console.log({ key });

    switch (key) {
      case 'BSC': {
        this.API_URL_MINT = this.API_URL.BSC;
        this.contractAddress = this.API_URL.BSC_Contract;
        this.chainId = 97;
        this.blockchain = 'BSC';
        break;
      }
      case 'AVA': {
        this.API_URL_MINT = this.API_URL.AVA;
        this.contractAddress = this.API_URL.AVA_Contract;
        this.chainId = 43113;
        this.blockchain = 'AVA';
        break;
      }
      case 'POLYGON': {
        this.API_URL_MINT = this.API_URL.POLYGON;
        this.contractAddress = this.API_URL.POLYGON_Contract;
        this.chainId = 80001;
        this.blockchain = 'POLYGON';
        break;
      }
      case 'ETH': {
        this.API_URL_MINT = this.API_URL.ETH;
        this.contractAddress = this.API_URL.ETH_Contract;
        this.chainId = 4;
        this.blockchain = 'ETH';
        break;
      }
      case 'KLAYTN': {
        this.API_URL_MINT = this.API_URL.KLAYTN;
        this.contractAddress = this.API_URL.KLAYTN_Contract;
        this.chainId = 1001;
        this.blockchain = 'KLAYTN';
        break;
      }
      default:
        break;
    }

  }



  createTokenId(address, contract) {
    return new Promise(async (resolve, reject) => {
      try {
        const tokenID = Math.floor(100000 + Math.random() * 900000);
        const exists = await this.checkTokenExists(tokenID, contract, address);
        console.log({ exists });

        if (exists) {
          this.createTokenId(address, contract);
          return;
        }
        resolve(tokenID);
      } catch (error) {
        console.log(error.message, error);
        reject(false);
      }
    });
  }

  checkTokenExists(tokenID, contract, address) {
    return new Promise(async (resolve, reject) => {
      try {
        let result;
        await contract.methods
          .ownerOf(tokenID)
          .call({
            from: address,
          })
          .then(function(res) {
            result = res;
            console.log({ res });

            resolve(true);
          });

      } catch (error) {
        console.log({ 'checkTokenExists Catch': error });

        resolve(false);
      }
    });

  }

  async generateKey() {
    const wallet = ethers?.Wallet?.createRandom();
    return wallet;
  }

  async importFromMnemonic(data) {
    const wallet = await ethers.Wallet.fromMnemonic(data);
    return wallet;
  }

}
