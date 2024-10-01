import type { ethers } from "ethers";
import { Contract } from "./contract";

export const erc20Abi = [
    "function balanceOf(address account) external view returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
];

export interface IERC20 {
    balanceOf(account: string): Promise<ethers.BigNumber>;
    approve(account: string, amount: ethers.BigNumber): Promise<ethers.ContractTransaction>;
    allowance(owner: string, spender: string): Promise<ethers.BigNumber>;
}

export class ERC20 extends Contract<IERC20> {
    constructor(address: string, signerOrProvider: ethers.Signer | ethers.providers.Provider) {
        super(address, erc20Abi, signerOrProvider);
    }
}
