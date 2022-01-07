"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const tx_1 = require("./sdk/tx");
const mnemonicProvider_1 = require("./mnemonicProvider");
const accessNode_1 = require("./api/accessNode");
// @ts-ignore
const fcl_1 = __importDefault(require("@onflow/fcl"));
// @ts-ignore
const t = __importStar(require("@onflow/types"));
const constants_1 = require("./constants");
const testTx_1 = require("./sdk/txs/testTx");
const setupStakingCollection_1 = require("./sdk/txs/setupStakingCollection");
const getDelegatorInfo_1 = require("./sdk/txs/getDelegatorInfo");
fcl_1.default.config(constants_1.TESTNET_CONFIG);
const accountIndex = 0;
function printAddress() {
    return __awaiter(this, void 0, void 0, function* () {
        const keyPair = yield (0, mnemonicProvider_1.getAccountKeyPair)(accountIndex);
        console.log((0, mnemonicProvider_1.getAccountAddress)(keyPair.pubKeyHex));
    });
}
function printAccountInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        const keyPair = yield (0, mnemonicProvider_1.getAccountKeyPair)(accountIndex);
        const address = (0, mnemonicProvider_1.getAccountAddress)(keyPair.pubKeyHex);
        console.log(yield (0, accessNode_1.getAccountInfo)(address));
    });
}
const getAuthFn = () => __awaiter(void 0, void 0, void 0, function* () {
    const keyPair = yield (0, mnemonicProvider_1.getAccountKeyPair)(accountIndex);
    const signFn = (0, mnemonicProvider_1.getSignFn)(keyPair.privKeyHex);
    const address = (0, mnemonicProvider_1.getAccountAddress)(keyPair.pubKeyHex);
    const { keys } = yield (0, accessNode_1.getAccountInfo)(address);
    return yield (0, tx_1.authz)(address, keys[accountIndex].index.toString(), signFn);
});
function testTx() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, accessNode_1.submitTx)(testTx_1.TestCode, yield getAuthFn());
    });
}
function setupStakingCollectionTx() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, accessNode_1.submitTx)(setupStakingCollection_1.SetupStakingCollectionCode, yield getAuthFn());
    });
}
function getStakingInfoTx() {
    return __awaiter(this, void 0, void 0, function* () {
        const keyPair = yield (0, mnemonicProvider_1.getAccountKeyPair)(accountIndex);
        const address = (0, mnemonicProvider_1.getAccountAddress)(keyPair.pubKeyHex);
        const args = [fcl_1.default.arg(address, t.Address)];
        console.log(yield (0, accessNode_1.executeScript)(getDelegatorInfo_1.GetDelegatorInfoCode, yield getAuthFn(), args));
    });
}
// printAddress()
// printAccountInfo()
// testTx()
getStakingInfoTx();
