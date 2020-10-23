import { ADDRESS_PREFIX, ADDRESS_PREFIX_BYTE, ADDRESS_SIZE } from "./address";
import { base64EncodeToString } from "./code";
import { base64DecodeFromString, hexStr2byteArray } from "./code";
import { encode58, decode58 } from "./base58";
import { byte2hexStr, byteArray2hexStr } from "./bytes";
import { ec as EC } from "elliptic";
import * as EthUtil from "ethereumjs-util";
import * as EthCrypto from "eth-crypto";
import * as RPL from "rlp";
import { keccak256, sha256 } from "./ethersUtils";

export function getBase58CheckAddress(addressBytes) {
    const hash0 = SHA256(addressBytes);
    const hash1 = SHA256(hash0);

    let checkSum = hash1.slice(0, 4);
    checkSum = addressBytes.concat(checkSum);

    return encode58(checkSum);
}

export function decodeBase58Address(base58Sting) {
    if (typeof base58Sting != "string") return false;

    if (base58Sting.length <= 4) return false;

    let address = decode58(base58Sting);

    if (base58Sting.length <= 4) return false;

    const len = address.length;
    const offset = len - 4;
    const checkSum = address.slice(offset);

    address = address.slice(0, offset);

    const hash0 = SHA256(address);
    const hash1 = SHA256(hash0);
    const checkSum1 = hash1.slice(0, 4);

    if (
        checkSum[0] == checkSum1[0] &&
        checkSum[1] == checkSum1[1] &&
        checkSum[2] == checkSum1[2] &&
        checkSum[3] == checkSum1[3]
    ) {
        return address;
    }

    throw new Error("Invalid address provided");
}

// export function signTransaction(priKeyBytes, transaction) {
//     if (typeof priKeyBytes === 'string')
//         priKeyBytes = hexStr2byteArray(priKeyBytes);

//     const txID = transaction.txID;
//     const signature = ECKeySign(hexStr2byteArray(txID), priKeyBytes);

//     if (Array.isArray(transaction.signature)) {
//         if (!transaction.signature.includes(signature))
//             transaction.signature.push(signature);
//     } else
//         transaction.signature = [signature];
//     return transaction;
// }
export async function signTransaction(txInfo, privateKey, indexes = [0], parentIndex = 0) {

    if(privateKey === ''){
        throw new Error("Invalid privateKey provided");
    }
    let {
        accountName,
        actionType,
        nonce,
        gasLimit,
        toAccountName,
        assetId,
        amount,
        remark,
        payload,
    } = txInfo.action;
    const payloadPrefix = payload.substring(0, 2);
    if (payloadPrefix !== "0x") {
        payload = '0x'+payload;
    }
    let actionHash = "";
    actionHash = EthUtil.rlphash([
        accountName,
        actionType,
        nonce,
        toAccountName,
        gasLimit,
        amount,
        payload,
        assetId,
        remark,
        txInfo.chainId,
        0,
        0,
    ]);
    const merkleRoot = EthUtil.keccak(actionHash);
    const txHash = EthUtil.rlphash([
        merkleRoot,
        txInfo.gasAssetId,
        txInfo.gasPrice,
    ]).toString("hex");
    const signature = EthCrypto.sign(privateKey, txHash);
    const signerInfo = await getSignerInfo(signature, parentIndex, txInfo.chainId, indexes);
    const list = [
        txInfo.gasAssetId,
        txInfo.gasPrice,
        [
            [
            actionType,
            nonce,
            assetId,
            accountName,
            toAccountName,
            gasLimit,
            amount,
            payload,
            remark,
            [signerInfo.parentIndex, [...signerInfo.signData]],
            ],
        ],
    ];
    let rlpData = RPL.encode(list);
    rlpData = "0x" + rlpData.toString("hex");
    return rlpData;
}

export function rlpEncode(input, isHex = true){
    let rlpData = RPL.encode(input)
    if(isHex){
        rlpData = "0x" + rlpData.toString("hex");
    }
    return rlpData;
}

export function rlpDecode(input, stream = false){ 
    return RPL.decode(input, stream);
}

export function baToJSON (ba) {
    if (Buffer.isBuffer(ba)) {
      return ba.toString('hex')
    } else if (ba instanceof Array) {
      var array = []
      for (var i = 0; i < ba.length; i++) {
        array.push(baToJSON(ba[i]))
      }
      return array
    }
  }

export async function getSignerInfo(signInfo, parentIndex ,chainId, indexes) {
    const multiSigInfos = [{ signInfo, indexes: indexes }];
    const sign = { parentIndex, signData: [] };
    for (const signInfo of multiSigInfos) {
      const rsv = getRSV(signInfo.signInfo, chainId);
      sign.signData.push([rsv.v, rsv.r, rsv.s, signInfo.indexes]);
    }
    return sign;
}

export function getRSV(signature, chainId) {
    let r = signature.slice(0, 66);
    let s = "0x" + signature.slice(66, 130);
    let v = "0x" + signature.slice(130, 132);
    r = trimHex(r);
    s = trimHex(s);
    if (chainId !== 0) {
      v = v === "0x1c" ? 1 : 0;
      v += chainId * 2 + 35;
      v = "0x" + v.toString(16);
    }
    return { r, s, v };
}

export function trimHex(str) {
    const z = str.substring(0, 4);
    if (z === "0x00") {
      str = str.replace("0x00", "0x");
    }
    return str;
}

export function arrayToBase64String(a) {
    return btoa(String.fromCharCode(...a));
}

export function signBytes(privateKey, contents) {
    if (typeof privateKey === "string")
        privateKey = hexStr2byteArray(privateKey);

    const hashBytes = SHA256(contents);
    const signBytes = ECKeySign(hashBytes, privateKey);

    return signBytes;
}

export function getRowBytesFromTransactionBase64(base64Data) {
    const bytesDecode = base64DecodeFromString(base64Data);
    const transaction = proto.protocol.Transaction.deserializeBinary(
        bytesDecode
    );
    const raw = transaction.getRawData();

    return raw.serializeBinary();
}

export function genPriKey() {
    const ec = new EC("secp256k1");
    const key = ec.genKeyPair();
    const priKey = key.getPrivate();

    let priKeyHex = priKey.toString("hex");

    while (priKeyHex.length < 64) {
        priKeyHex = `0${priKeyHex}`;
    }

    return hexStr2byteArray(priKeyHex);
}

export function computeAddress(pubBytes) {
    if (pubBytes.length === 65) pubBytes = pubBytes.slice(1);

    const hash = keccak256(pubBytes).toString().substring(2);
    const addressHex = ADDRESS_PREFIX + hash.substring(24);

    return hexStr2byteArray(addressHex);
}

export function getAddressFromPriKey(priKeyBytes) {
    let pubBytes = getPubKeyFromPriKey(priKeyBytes);
    return computeAddress(pubBytes);
}

export function decode58Check(addressStr) {
    const decodeCheck = decode58(addressStr);

    if (decodeCheck.length <= 4) return false;

    const decodeData = decodeCheck.slice(0, decodeCheck.length - 4);
    const hash0 = SHA256(decodeData);
    const hash1 = SHA256(hash0);

    if (
        hash1[0] === decodeCheck[decodeData.length] &&
        hash1[1] === decodeCheck[decodeData.length + 1] &&
        hash1[2] === decodeCheck[decodeData.length + 2] &&
        hash1[3] === decodeCheck[decodeData.length + 3]
    ) {
        return decodeData;
    }

    return false;
}

export function isAddressValid(base58Str) {
    if (typeof base58Str !== "string") return false;

    if (base58Str.length !== ADDRESS_SIZE) return false;

    let address = decode58(base58Str);

    if (address.length !== 25) return false;

    if (address[0] !== ADDRESS_PREFIX_BYTE) return false;

    const checkSum = address.slice(21);
    address = address.slice(0, 21);

    const hash0 = SHA256(address);
    const hash1 = SHA256(hash0);
    const checkSum1 = hash1.slice(0, 4);

    if (
        checkSum[0] == checkSum1[0] &&
        checkSum[1] == checkSum1[1] &&
        checkSum[2] == checkSum1[2] &&
        checkSum[3] == checkSum1[3]
    ) {
        return true;
    }

    return false;
}

export function getBase58CheckAddressFromPriKeyBase64String(
    priKeyBase64String
) {
    const priKeyBytes = base64DecodeFromString(priKeyBase64String);
    const pubBytes = getPubKeyFromPriKey(priKeyBytes);
    const addressBytes = computeAddress(pubBytes);

    return getBase58CheckAddress(addressBytes);
}

export function getHexStrAddressFromPriKeyBase64String(priKeyBase64String) {
    const priKeyBytes = base64DecodeFromString(priKeyBase64String);
    const pubBytes = getPubKeyFromPriKey(priKeyBytes);
    const addressBytes = computeAddress(pubBytes);
    const addressHex = byteArray2hexStr(addressBytes);

    return addressHex;
}

export function getAddressFromPriKeyBase64String(priKeyBase64String) {
    const priKeyBytes = base64DecodeFromString(priKeyBase64String);
    const pubBytes = getPubKeyFromPriKey(priKeyBytes);
    const addressBytes = computeAddress(pubBytes);
    const addressBase64 = base64EncodeToString(addressBytes);

    return addressBase64;
}

export function getPubKeyFromPriKey(priKeyBytes, isHex = false) {
    const ec = new EC("secp256k1");
    const key = ec.keyFromPrivate(priKeyBytes, "bytes");
    const pubkey = key.getPublic();
    const x = pubkey.x;
    const y = pubkey.y;

    let xHex = x.toString("hex");

    while (xHex.length < 64) {
        xHex = `0${xHex}`;
    }

    let yHex = y.toString("hex");

    while (yHex.length < 64) {
        yHex = `0${yHex}`;
    }

    const pubkeyHex = `04${xHex}${yHex}`;
    if(isHex){
        return pubkeyHex;
    }
    const pubkeyBytes = hexStr2byteArray(pubkeyHex);

    return pubkeyBytes;
}

export function ECKeySign(hashBytes, priKeyBytes) {
    const ec = new EC("secp256k1");
    const key = ec.keyFromPrivate(priKeyBytes, "bytes");
    const signature = key.sign(hashBytes);
    const r = signature.r;
    const s = signature.s;
    const id = signature.recoveryParam;

    let rHex = r.toString("hex");

    while (rHex.length < 64) {
        rHex = `0${rHex}`;
    }

    let sHex = s.toString("hex");

    while (sHex.length < 64) {
        sHex = `0${sHex}`;
    }

    const idHex = byte2hexStr(id);
    const signHex = rHex + sHex + idHex;

    return signHex;
}

export function SHA256(msgBytes) {
    const msgHex = byteArray2hexStr(msgBytes);
    const hashHex = sha256("0x" + msgHex).replace(/^0x/, "");
    return hexStr2byteArray(hashHex);
}

export function passwordToAddress(password) {
    const com_priKeyBytes = base64DecodeFromString(password);
    const com_addressBytes = getAddressFromPriKey(com_priKeyBytes);

    return getBase58CheckAddress(com_addressBytes);
}

export function pkToAddress(privateKey) {
    const com_priKeyBytes = hexStr2byteArray(privateKey);
    const com_addressBytes = getAddressFromPriKey(com_priKeyBytes);

    return getBase58CheckAddress(com_addressBytes);
}
