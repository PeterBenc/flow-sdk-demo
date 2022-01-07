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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountAddress = exports.getAccountKeyPair = exports.getSignFn = void 0;
const elliptic_1 = require("elliptic");
const sha3_1 = require("sha3");
const constants_1 = require("./constants");
const mnemonic_1 = require("./mnemonic");
const ec = new elliptic_1.ec("p256");
const hashMsgHex = (msgHex) => {
    const sha = new sha3_1.SHA3(256);
    sha.update(Buffer.from(msgHex, "hex"));
    return sha.digest();
};
// https://github.dev/MaxStalker/flow-multipart-sign-process/tree/main/frontend/src
const getSignFn = (privKey) => {
    return (signable) => {
        // console.log({ privKey, signable });
        const key = ec.keyFromPrivate(Buffer.from(privKey, "hex"));
        const sig = key.sign(hashMsgHex(signable));
        const n = 32; // half of signature length?
        const r = sig.r.toArrayLike(Buffer, "be", n);
        const s = sig.s.toArrayLike(Buffer, "be", n);
        return Promise.resolve(Buffer.concat([r, s]).toString("hex"));
    };
};
exports.getSignFn = getSignFn;
const getAccountKeyPair = (accountIndex) => __awaiter(void 0, void 0, void 0, function* () {
    const seed = yield (0, mnemonic_1.mnemonicToSeed)(constants_1.MNEMONIC);
    // const rootKeyPair = ec.genKeyPair({entropy: seed})
    // const {privateKey, publicKey, chainCode, network} =  root.derivePath("m/44'/539'/0'")
    // TODO: derive the public key from seed
    return {
        privKeyHex: 'bfba4182bbfa8fcbbe5a65d01061f0792a3d36de6db2f307396e9f7c07e4845c',
        pubKeyHex: 'ae59227297f225a03730e10c53d88212523006f14963dd01ab401b1f7c4a571d7fbcb45bb5d69723beba0451ae5f625321da49dc4d4b088b35d65da3200aa2ea',
    };
});
exports.getAccountKeyPair = getAccountKeyPair;
const getAccountAddress = (publicKey) => {
    return '0xfabf8975b228146d'; // TODO: get from flowport api
};
exports.getAccountAddress = getAccountAddress;
