import { ethers } from "ethers";
import { Contract } from "./contract";

export const interchainTokenServiceAbi = [
    "function interchainTransfer(bytes32 tokenId, string calldata destinationChain, bytes calldata destinationAddress, uint256 amount, bytes calldata metadata, uint256 gasValue) external payable",
];

export interface IInterchainTokenService {
    interchainTransfer(
        tokenId: string,
        destinationChain: string,
        destinationAddress: string,
        amount: ethers.BigNumberish,
        metadata?: string,
        gasValue?: ethers.BigNumberish,
    ): Promise<ethers.ContractTransaction>;
}

export class InterchainTokenService extends Contract<IInterchainTokenService> {
    constructor(address: string, signerOrProvider: ethers.Signer | ethers.providers.Provider) {
        super(address, interchainTokenServiceAbi, signerOrProvider);
    }
}
