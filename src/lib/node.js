import GonWeb from 'index';
import utils from 'utils';
import injectpromise from 'injectpromise';

export default class Node {
    constructor(gonWeb = false) {
        if (!gonWeb || !gonWeb instanceof GonWeb)
            throw new Error('Expected instance of GonWeb');

        this.gonWeb = gonWeb;
        this.injectPromise = injectpromise(this);
    }
    getTransactionInfoByHash(blockHash, callback = false) {
        if (!callback)
            return this.injectPromise(this.getTransactionInfoByHash, blockHash);

        this.gonWeb.fullNode.request('getTransactionInfoByHash', {
            hash: blockHash
        }).then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }
    getTransactionReceipt(blockHash, callback = false) {
        if (!callback)
            return this.injectPromise(this.getTransactionReceipt, blockHash);

        this.gonWeb.fullNode.request('getTransactionReceipt', {
            hash: blockHash
        }).then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }
    getChainConfig( callback = false) {
        if (!callback)
            return this.injectPromise(this.getChainConfig);

        this.gonWeb.fullNode.request('getChainConfig').then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }
    getGasPrice( callback = false) {
        if (!callback)
            return this.injectPromise(this.getGasPrice);

        this.gonWeb.fullNode.request('getGasPrice').then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }
    getAssetInfoById(assetId, callback = false) {
        if (!callback)
            return this.injectPromise(this.getAssetInfoById, assetId);

        this.gonWeb.fullNode.request('getAssetInfoById', {
            assetId: assetId
        }).then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }

    getAssetInfoByName(assetName, callback = false) {
        if (!callback)
            return this.injectPromise(this.getAssetInfoByName, assetName);

        this.gonWeb.fullNode.request('getAssetInfoByName', {
            assetName: assetName
        }).then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }
    getContract(name, callback = false) {
        if (!callback)
            return this.injectPromise(this.getContract, name);

        this.gonWeb.fullNode.request('getContract', {
            name: name
        }).then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }
    getAccount(name, callback = false) {
        if (!callback)
            return this.injectPromise(this.getAccount, name);

        this.gonWeb.fullNode.request('getAccount', {
            name: name
        }).then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }
    getNonce(name, callback = false) {
        if (!callback)
            return this.injectPromise(this.getNonce, name);

        this.gonWeb.fullNode.request('getNonce', {
            name: name
        }).then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }
    getAccountBalance(name, assetId, callback = false) {
        if (!callback)
            return this.injectPromise(this.getAccountBalance, name, assetId);

        this.gonWeb.fullNode.request('getAccountBalance', {
            name: name,
            assetId:assetId
        }).then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }
    accountExist(name, callback = false) {
        if (!callback)
            return this.injectPromise(this.accountExist, name);

        this.gonWeb.fullNode.request('accountExist', {
            name: name
        }).then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }
    accountTransfers(options, callback = false) {
        if (!callback)
            return this.injectPromise(this.accountTransfers, options);
        this.gonWeb.fullNode.request('accountTransfers', options, 'post').then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }

    getContractResult(options, callback = false) {
        if (!callback)
            return this.injectPromise(this.getContractResult, options);
        this.gonWeb.fullNode.request('getContractResult', options, 'post').then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }

    async sign(transaction = false, privateKey = this.gonWeb.defaultPrivateKey, callback = false) {

        if (!callback)
            return this.injectPromise(this.sign, transaction, privateKey);
        if (!utils.isObject(transaction))
            return callback('Invalid transaction provided');

        try {
            return callback(null,
                {rawData:await utils.crypto.signTransaction(transaction, privateKey)}
            );
        } catch (ex) {
            callback(ex);
        }
    }

    sendRawTransaction(rawData, callback = false){
        if (!callback)
        return this.injectPromise(this.sendRawTransaction, rawData);
        this.gonWeb.fullNode.request('broadcast', rawData, 'post').then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }

}