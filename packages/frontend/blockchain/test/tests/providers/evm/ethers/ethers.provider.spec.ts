import { BigNumber } from "ethers";
import { EthersProvider } from "../../../../../src/providers/evm/ethers";
import { ERC20Mock } from "@shared/evm/mocks/contracts";
import { ERC20 } from "@shared/evm/contracts";
import { MethodMock } from "@shared/test";
import { ProviderMock } from "@shared/evm/mocks/ethers";
import { TokenMock } from "@frontend/token/mocks/common";

describe("EthersProvider", () => {
    let ethersProvider: EthersProvider;

    const addressMock = "0x123";
    const internalEthersProvider = new ProviderMock();

    beforeEach(() => {
        internalEthersProvider.clearMocks();

        ethersProvider = new EthersProvider(internalEthersProvider);
    });

    describe("getTokenContract", () => {
        it("should return a new ERC20 contract", () => {
            const tokenContract = ethersProvider["getERC20Contract"]("0x123");

            expect(tokenContract).toBeInstanceOf(ERC20);
        });
    });

    describe("getNativeBalance", () => {
        it("should return the native balance of the given address", async () => {
            const mockNativeBalance = BigNumber.from(1);
            internalEthersProvider.getBalance.mockResolvedValueOnce(mockNativeBalance);

            const balance = await ethersProvider.getNativeBalance(addressMock);

            expect(balance).toBe(mockNativeBalance.toString());
        });
    });

    describe("getNonce", () => {
        it("should return the nonce of the given address", async () => {
            const mockNonce = 1;
            internalEthersProvider.getTransactionCount.mockResolvedValueOnce(mockNonce);

            const nonce = await ethersProvider.getNonce(addressMock);

            expect(nonce).toBe(mockNonce);
        });
    });

    describe("isAccountActive", () => {
        it("should return true when the account has a balance and a nonce greater than 0", async () => {
            const mockBalance = BigNumber.from(1);
            const mockNonce = 1;
            internalEthersProvider.getBalance.mockResolvedValueOnce(mockBalance);
            internalEthersProvider.getTransactionCount.mockResolvedValueOnce(mockNonce);

            const isActive = await ethersProvider.isAccountActive(addressMock);

            expect(isActive).toBe(true);
        });

        it("should return false when the account has a balance and nonce equal to 0", async () => {
            const mockBalance = BigNumber.from(0);
            const mockNonce = 0;
            internalEthersProvider.getBalance.mockResolvedValueOnce(mockBalance);
            internalEthersProvider.getTransactionCount.mockResolvedValueOnce(mockNonce);

            const isActive = await ethersProvider.isAccountActive(addressMock);

            expect(isActive).toBe(false);
        });
    });

    describe("getERC20Balance", () => {
        it("should return the ERC20 balance of the given address", async () => {
            const mockBalance = BigNumber.from(1);
            jest.spyOn(ethersProvider as any, "getERC20Contract").mockReturnValueOnce(
                new ERC20Mock({
                    balanceOf: new MethodMock("mockResolvedValue", mockBalance),
                }),
            );

            const balance = await ethersProvider.getERC20Balance(addressMock, "0x456");

            expect(balance).toBe(mockBalance.toString());
        });
    });

    describe("getTokenBalance", () => {
        it("should return the native balance if the token is native", async () => {
            const tokenMock = new TokenMock({ isNative: jest.fn().mockReturnValue(true) });
            const nativeBalanceMock = "200";

            const getNativeBalanceSpy = jest.spyOn(ethersProvider, "getNativeBalance").mockResolvedValueOnce(nativeBalanceMock);

            const result = await ethersProvider.getTokenBalance(addressMock, tokenMock);

            expect(getNativeBalanceSpy).toHaveBeenCalledWith(addressMock);
            expect(result).toBe(nativeBalanceMock);
        });

        it("should return the IOU balance if the token is not native", async () => {
            const tokenMock = new TokenMock({ isNative: jest.fn().mockReturnValue(false) });
            const iouBalanceMock = "100";

            const getERC20BalanceSpy = jest.spyOn(ethersProvider, "getERC20Balance").mockResolvedValueOnce(iouBalanceMock);

            const result = await ethersProvider.getTokenBalance(addressMock, tokenMock);

            expect(getERC20BalanceSpy).toHaveBeenCalledWith(addressMock, tokenMock.address!);
            expect(result).toBe(iouBalanceMock);
        });
    });
});
