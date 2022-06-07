"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.operationMapping = void 0;
var ssidOperations = require("../operations/ssidOperations/ssidOperations");
var networkOperations = require("../operations/networkOperations/networkANdFileOperations");
var blockchainOperations = require("../operations/blockchainOperations/blockchainOperations");
exports.operationMapping = {
    SSID: ssidOperations,
    NETWORK: networkOperations,
    BLOCKCHAIN: blockchainOperations,
};
//# sourceMappingURL=operations.js.map