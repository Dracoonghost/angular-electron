import * as ssidOperations from '../operations/ssidOperations/ssidOperations';
import * as networkOperations from '../operations/networkOperations/networkANdFileOperations';
import * as blockchainOperations from '../operations/blockchainOperations/blockchainOperations';
export const operationMapping = {
    SSID: ssidOperations,
    NETWORK: networkOperations,
    BLOCKCHAIN: blockchainOperations,
}