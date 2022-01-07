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
exports.authz = void 0;
// @ts-ignore
const fcl_1 = __importDefault(require("@onflow/fcl"));
const authz = (address, keyId, signFn) => __awaiter(void 0, void 0, void 0, function* () {
    // authorization function need to return an account
    return (account) => {
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
