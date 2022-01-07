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
exports.mnemonicToSeed = void 0;
const bip39_1 = require("bip39");
const mnemonicToSeed = (mnemonic) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(0, bip39_1.validateMnemonic)(mnemonic)) {
        throw new Error('Invalid mnemonic words');
    }
    const seed = yield (0, bip39_1.mnemonicToSeed)(mnemonic);
    return Buffer.from(seed).toString('hex');
});
exports.mnemonicToSeed = mnemonicToSeed;
