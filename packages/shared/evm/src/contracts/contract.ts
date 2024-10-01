import { BaseContract as EthersContract, type ethers } from "ethers";

export const Contract = EthersContract as unknown as new <T>(
    address: string,
    abi: ethers.ContractInterface,
    signerOrProvider: ethers.Signer | ethers.providers.Provider,
) => EthersContract & T;
