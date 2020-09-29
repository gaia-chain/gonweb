import providers from './lib/providers';
import utils from './utils';
import BigNumber from 'bignumber.js';
import { keccak256 } from 'utils/ethersUtils';

import TransactionBuilder from 'lib/transactionBuilder';
import Node from './lib/node';

export default class GonWeb {
    static utils = utils;
    static Node = Node;
    static providers = providers;
    static BigNumber = BigNumber;
    static TransactionBuilder = TransactionBuilder;
    constructor(options = false, privateKey = false, chainId = 1){
        let fullNode;

        if (typeof options === 'object' && (options.fullNode || options.fullHost)) {
            fullNode = options.fullNode || options.fullHost;
            privateKey = options.privateKey;
        } else {
            fullNode = options;
        }
        if (utils.isString(fullNode)){
            fullNode = new providers.HttpProvider(fullNode);
        }
        this.node = new Node(this);
        this.transactionBuilder = new TransactionBuilder(this);
        this.utils = utils;
        this.setFullNode(fullNode);
        this.providers = providers;
        this.defaultPrivateKey = false;
        this.chainId = chainId;
        [
            'sha3', 'toHex', 'toUtf8', 'fromUtf8','toAscii', 'fromAscii', 'toDecimal', 'fromDecimal', 'toBigNumber','createAccount'
        ].forEach(key => {
            this[key] = GonWeb[key];
        });
    }
    setPrivateKey(privateKey) {
        try {
            this.setAddress(
                this.address.fromPrivateKey(privateKey)
            );
        } catch {
            throw new Error('Invalid private key provided');
        }

        this.defaultPrivateKey = privateKey;
    }
    setChainId(chainId) {
        this.chainId = chainId;
    }
    isValidProvider(provider) {
        return Object.values(providers).some(knownProvider => provider instanceof knownProvider);
    }
    setFullNode(fullNode) {
        if (utils.isString(fullNode))
            fullNode = new providers.HttpProvider(fullNode);

        if (!this.isValidProvider(fullNode))
            throw new Error('Invalid full node provided');

        this.fullNode = fullNode;
    }
    static getPubKeyFromPrivateKey(privateKey) {
        try {
            return utils.crypto.getPubKeyFromPriKey(privateKey, true);
        } catch {
            return false;
        }
    }

    static sha3(string, prefix = true) {
        return (prefix ? '0x' : '') + keccak256(Buffer.from(string, 'utf-8')).toString().substring(2);
    }

    static toHex(val) {
        if (utils.isBoolean(val))
            return GonWeb.fromDecimal(+val);

        if (utils.isBigNumber(val))
            return GonWeb.fromDecimal(val);

        if (typeof val === 'object')
            return GonWeb.fromUtf8(JSON.stringify(val));

        if (utils.isString(val)) {
            if (/^(-|)0x/.test(val))
                return val;

            if ((!isFinite(val)) || /^\s*$/.test(val))
                return GonWeb.fromUtf8(val);
        }

        let result = GonWeb.fromDecimal(val);
        if (result === '0xNaN') {
            throw new Error('The passed value is not convertible to a hex string');
        } else {
            return result;
        }
    }

    static toUtf8(hex) {
        if (utils.isHex(hex)) {
            hex = hex.replace(/^0x/, '');
            return Buffer.from(hex, 'hex').toString('utf8');
        } else {
            throw new Error('The passed value is not a valid hex string');
        }
    }

    static fromUtf8(string) {
        if (!utils.isString(string)) {
            throw new Error('The passed value is not a valid utf-8 string')
        }
        return '0x' + Buffer.from(string, 'utf8').toString('hex');
    }

    static toAscii(hex) {
        if (utils.isHex(hex)) {
            let str = "";
            let i = 0, l = hex.length;
            if (hex.substring(0, 2) === '0x') {
                i = 2;
            }
            for (; i < l; i += 2) {
                let code = parseInt(hex.substr(i, 2), 16);
                str += String.fromCharCode(code);
            }
            return str;
        } else {
            throw new Error('The passed value is not a valid hex string');
        }
    }

    static fromAscii(string, padding) {
        if (!utils.isString(string)) {
            throw new Error('The passed value is not a valid utf-8 string')
        }
        return '0x' + Buffer.from(string, 'ascii').toString('hex').padEnd(padding, '0');
    }


    static toDecimal(value) {
        return GonWeb.toBigNumber(value).toNumber();
    }

    static fromDecimal(value) {
        const number = GonWeb.toBigNumber(value);
        const result = number.toString(16);

        return number.isLessThan(0) ? '-0x' + result.substr(1) : '0x' + result;
    }

    static toBigNumber(amount = 0) {
        if (utils.isBigNumber(amount))
            return amount;

        if (utils.isString(amount) && /^(-|)0x/.test(amount))
            return new BigNumber(amount.replace('0x', ''), 16);

        return new BigNumber(amount.toString(10), 10);
    }

    static isAddress(address = false) {
        if (!utils.isString(address))
            return false;

        // Convert HEX to Base58
        if (address.length === 42) {
            try {
                return GonWeb.isAddress(
                    utils.crypto.getBase58CheckAddress(
                        utils.code.hexStr2byteArray(address) // it throws an error if the address starts with 0x
                    )
                );
            } catch (err) {
                return false;
            }
        }
        try {
            return utils.crypto.isAddressValid(address);
        } catch (err) {
            return false;
        }
    }
    static async createAccount() {
        const account = utils.accounts.generateAccount();
        return account;
    }
}