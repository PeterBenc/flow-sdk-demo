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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitTx = exports.getSignFn = exports.authz = void 0;
// @ts-ignore
const fcl_1 = __importDefault(require("@onflow/fcl"));
const elliptic_1 = __importDefault(require("elliptic"));
const sha3_1 = require("sha3");
const { ec: EC } = elliptic_1.default;
const ec = new EC("p256");
const authz = ({ address, keyId, signFn }) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(fcl.sansPrefix(address), fcl.withPrefix(address), keyId)
    // authorization function need to return an account
    return (account = {}) => {
        // console.log(account)
        return Object.assign(Object.assign({}, account), { tempId: `${address}-${keyId}`, addr: fcl_1.default.sansPrefix(address), keyId: Number(keyId), signingFunction: (signable) => __awaiter(void 0, void 0, void 0, function* () {
                // Singing functions are passed a signable and need to return a composite signature
                // signable.message is a hex string of what needs to be signed.
                return {
                    addr: fcl_1.default.withPrefix(address),
                    keyId: Number(keyId),
                    signature: yield signFn(signable.message), // this needs to be a hex string of the signature, where signable.message is the hex value that needs to be signed
                };
            }) });
    };
});
exports.authz = authz;
const hashMsgHex = (msgHex) => {
    const sha = new sha3_1.SHA3(256);
    sha.update(Buffer.from(msgHex, "hex"));
    return sha.digest();
};
const getSignFn = (privKey) => {
    return (signable) => {
        console.log({ privKey, signable });
        const key = ec.keyFromPrivate(Buffer.from(privKey, "hex"));
        const sig = key.sign(hashMsgHex(signable));
        const n = 32; // half of signature length?
        const r = sig.r.toArrayLike(Buffer, "be", n);
        const s = sig.s.toArrayLike(Buffer, "be", n);
        return Promise.resolve(Buffer.concat([r, s]).toString("hex"));
    };
};
exports.getSignFn = getSignFn;
const submitTx = (tx, authFn) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('sdfsdfiu')
    const txHash = yield fcl_1.default.send([
        fcl_1.default.transaction `transaction() { prepare(acct: AuthAccount) {} execute { log("Hello, Flow!") } }`,
        fcl_1.default.proposer(authFn),
        fcl_1.default.payer(authFn),
        fcl_1.default.authorizations([authFn]),
        // fcl.ref(block.id),
        fcl_1.default.limit(5000),
    ]);
    console.log({ txHash });
    const result = yield fcl_1.default.tx(txHash).onceExecuted();
    console.log({ result });
});
exports.submitTx = submitTx;
