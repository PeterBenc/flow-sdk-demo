"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCode = void 0;
exports.TestCode = `
  transaction() { prepare(acct: AuthAccount) {} execute { log("Hello, Flow!") } }
`;
