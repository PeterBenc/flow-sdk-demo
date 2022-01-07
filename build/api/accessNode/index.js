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
exports.executeScript = exports.submitTx = exports.getAccountInfo = void 0;
// @ts-ignore
const fcl_1 = __importDefault(require("@onflow/fcl"));
const getAccountInfo = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const { account: user } = yield fcl_1.default.send([fcl_1.default.getAccount(address)]);
    // console.log(user)
    return user;
});
exports.getAccountInfo = getAccountInfo;
const submitTx = (tx, authFn, args = []) => __awaiter(void 0, void 0, void 0, function* () {
    const txHash = yield fcl_1.default.send([
        fcl_1.default.transaction `${tx}`,
        fcl_1.default.args(args),
        fcl_1.default.proposer(authFn),
        fcl_1.default.payer(authFn),
        fcl_1.default.authorizations([authFn]),
        fcl_1.default.limit(5000),
    ]);
    // console.log({ txHash });
    const { events } = yield fcl_1.default.tx(txHash).onceExecuted();
    console.log(events);
});
exports.submitTx = submitTx;
const executeScript = (script, authFn, args = []) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield fcl_1.default.send([
        fcl_1.default.script `${script}`,
        fcl_1.default.args(args),
        fcl_1.default.proposer(authFn),
        fcl_1.default.payer(authFn),
        fcl_1.default.authorizations([authFn]),
        fcl_1.default.limit(5000),
    ]);
    return fcl_1.default.decode(res);
});
exports.executeScript = executeScript;
