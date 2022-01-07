"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDelegatorInfoCode = void 0;
exports.GetDelegatorInfoCode = `
import FlowIDTableStaking from 0xIDENTITYTABLEADDRESS
import FlowStakingCollection from 0xSTAKINGCOLLECTIONADDRESS
  pub fun main(address: Address): [FlowIDTableStaking.DelegatorInfo] {
      return FlowStakingCollection.getAllDelegatorInfo(address: address)
  }
`;
