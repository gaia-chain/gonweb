import {AbiCoder} from './ethersUtils';
import GonWeb from 'index';
import {ADDRESS_PREFIX, ADDRESS_PREFIX_REGEX} from 'utils/address';

const abiCoder = new AbiCoder();

export function decodeParams(names, types, output, ignoreMethodHash) {

    if (!output || typeof output === 'boolean') {
        ignoreMethodHash = output;
        output = types;
        types = names;
        names = [];
    }

    if (ignoreMethodHash && output.replace(/^0x/, '').length % 64 === 8)
        output = '0x' + output.replace(/^0x/, '').substring(8);

    if (output.replace(/^0x/, '').length % 64)
        throw new Error('The encoded string is not valid. Its length must be a multiple of 64.');

    // workaround for unsupported trcToken type
    types = types.map(type => {
        if (/trcToken/.test(type)) {
            type = type.replace(/trcToken/, 'uint256')
        }
        return type
    })

    return abiCoder.decode(types, output).reduce((obj, arg, index) => {
        if (types[index] == 'address')
            arg = ADDRESS_PREFIX + arg.substr(2).toLowerCase();

        if (names.length)
            obj[names[index]] = arg;
        else obj.push(arg);

        return obj;
    }, names.length ? {} : []);
}
export function decodeOutput(data){
    if(!data.parameter.abi){
        throw new Error('abi does not exist');
    }
    let abi = data.parameter.abi;
    if(!GonWeb.utils.isObject(abi)){
        abi = JSON.parse(abi)
    }
    let func = data.parameter.function;
    let outputs = []
    abi.forEach((item) => {
        if(item.name === func){
            outputs = item.outputs;
        }
    })
    if(!outputs.length === 0){
        throw new Error('function does not exist');
    }
    let output = data.result;
    const names = outputs.map(({name}) => name).filter(name => !!name);
    const types = outputs.map(({type}) => type);
    return abiCoder.decode(types, output).reduce((obj, arg, index) => {
        if (types[index] == 'address')
            arg = GonWeb.toDecimal(arg);

        if(arg._ethersType && arg._ethersType === 'BigNumber'){
            arg = GonWeb.toDecimal(arg._hex);
        }
        if (names.length)
            obj[names[index]] = arg;
        else obj.push(arg);

        return obj;
    }, names.length ? {} : []);
};
export function encodeParams(types, values) {

    for (let i = 0; i < types.length; i++) {
        if (types[i] === 'address') {
            values[i] = GonWeb.address.toHex(values[i]).replace(ADDRESS_PREFIX_REGEX, '0x');
        }
    }

    return abiCoder.encode(types, values);
}
