import { ethers } from "ethers";
import { Unconfirmed, Transaction } from "@shared/modules/blockchain";
import { IEthersSignerProvider } from "./interfaces/i-ethers-signer.provider";
import { EthersProvider } from "../../../providers/evm/ethers/ethers.provider";
import { SignerError } from "../../core/error";
import { EthersSignerErrors } from "./ethers.signer.errors";
import { EthersTransactionParser } from "../../../transaction-parsers/evm/ethers/ethers.transaction-parser";
import { ERC20, InterchainTokenService } from "@shared/evm/contracts";
import { Chain } from "@frontend/chain";
import { Token } from "@frontend/token";
import { decimalToInt } from "@shared/number";
import { IEthersSigner } from "./interfaces";

export class EthersSigner<Provider extends IEthersSignerProvider = IEthersSignerProvider> implements IEthersSigner {
    protected signer: ethers.Signer;
    protected readonly transactionParser: EthersTransactionParser;

    readonly provider: Provider;

    constructor(signer: ethers.Signer, provider?: Provider) {
        if (provider) this.provider = provider;
        else if (signer.provider) {
            this.provider = new EthersProvider(signer.provider) as unknown as Provider;
        } else throw new SignerError(EthersSignerErrors.PROVIDER_NOT_PROVIDED);

        this.transactionParser = new EthersTransactionParser();
        this.signer = signer;
    }

    /**
     * @inheritdoc
     */
    protected getERC20Contract(address: string): ERC20 {
        return this.provider.getERC20Contract(address, this.signer);
    }

    /**
     * @inheritdoc
     */
    protected getInterchainTokenServiceContract(address: string): InterchainTokenService {
        return this.provider.getInterchainTokenServiceContract(address, this.signer);
    }

    /**
     * @inheritdoc
     */
    async getAddress(): Promise<string> {
        return this.signer.getAddress();
    }

    /**
     * @inheritdoc
     */
    async approveERC20(address: string, spender: string): Promise<Unconfirmed<Transaction>> {
        const erc20 = this.getERC20Contract(address);
        const contractTx = await erc20.approve(spender, ethers.constants.MaxUint256);

        return this.transactionParser.parseTransactionResponse(contractTx);
    }

    /**
     * @inheritdoc
     */
    async transfer(
        amount: string,
        token: Token,
        doorAddress: string,
        destinationChain: Chain,
        destinationAddress: string,
    ): Promise<Unconfirmed<Transaction>> {
        const sendingAmount = ethers.BigNumber.from(decimalToInt(amount, token.decimals));

        const interchainTokenService = this.getInterchainTokenServiceContract(doorAddress);

        const contractTx = await interchainTokenService.interchainTransfer(
            token.id!,
            destinationChain.id,
            destinationAddress,
            sendingAmount,
            "0x",
            ethers.BigNumber.from("0"),
        );

        return this.transactionParser.parseTransactionResponse(contractTx);
    }
}
