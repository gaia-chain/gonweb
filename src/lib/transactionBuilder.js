import GonWeb from 'index';
import injectpromise from 'injectpromise';


export default class TransactionBuilder {
    constructor(gonWeb = false) {
        if (!gonWeb || !gonWeb instanceof GonWeb)
            throw new Error('Expected instance of GonWeb');

        this.gonWeb = gonWeb;
        this.injectPromise = injectpromise(this);
    }
    triggerCreatAccount(options, callback = false) {
        if (!callback)
            return this.injectPromise(this.triggerCreatAccount, options);
        this.gonWeb.fullNode.request('triggerCreatAccount', options, 'post').then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }
    triggerUpdateAccountAuthor(options, callback = false) {
        if (!callback)
            return this.injectPromise(this.triggerUpdateAccountAuthor, options);
        this.gonWeb.fullNode.request('triggerUpdateAccountAuthor', options, 'post').then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }
    triggerSmartContract(options, callback = false) {
        if (!callback)
            return this.injectPromise(this.triggerSmartContract, options);
        this.gonWeb.fullNode.request('triggerSmartContract', options, 'post').then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }
    triggerCreateContract(options, callback = false) {
        if (!callback)
            return this.injectPromise(this.triggerCreateContract, options);
        this.gonWeb.fullNode.request('triggerCreateContract', options, 'post').then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }
    triggerUpdateContract(options, callback = false) {
        if (!callback)
            return this.injectPromise(this.triggerUpdateContract, options);
        this.gonWeb.fullNode.request('triggerUpdateContract', options, 'post').then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }
    triggerIssueAsset(options, callback = false) {
        if (!callback)
            return this.injectPromise(this.triggerIssueAsset, options);
        this.gonWeb.fullNode.request('triggerIssueAsset', options, 'post').then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }
    triggerIncrementAsset(options, callback = false) {
        if (!callback)
            return this.injectPromise(this.triggerIncrementAsset, options);
        this.gonWeb.fullNode.request('triggerIncrementAsset', options, 'post').then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }
    triggerTransfer(options, callback = false) {
        if (!callback)
            return this.injectPromise(this.triggerTransfer, options);
        this.gonWeb.fullNode.request('triggerTransfer', options, 'post').then(result => {
            callback(null, result);
        }).catch(err => callback(err));
    }
}