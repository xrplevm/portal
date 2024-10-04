import { ConfigManagerMock } from "@frontend/config/mocks/core/manager";
import { AxelarService } from "../../src/axelar.service";
import { mockify } from "@shared/test";
import { AxelarChain } from "../../src/models/axelar-chain";
import { AxelarChainObjectMock } from "../mocks/types/axelar-chain-object.mock";
import { ServiceError } from "@frontend/core/data-access/service/error";
import { AxelarErrors } from "../../src/axelar.errors";
import { AxelarInterchainTokenObjectMock } from "../mocks/types/axelar-interchain-token-object.mock";
import { ChainMock } from "@frontend/chain/mocks/common";
import { AxelarInterchainToken } from "../../src/models/axelar-interchain-token";
import { AxelarGMPTransferContractMethod } from "../../src";
import { AxelarGMPTransfersObjectMock } from "../mocks/types/axelar-gmp-transfers-object.mock";

describe("AxelarService", () => {
    let axelarService: AxelarService;

    const configManagerMock = new ConfigManagerMock();

    const axelarUrlMock = "https://axelar.url";
    const axelarApiUrlMock = "https://axelar.api.url";
    const axelarGmpUrlMock = "https://axelar.gmp.url";
    const getChainsResponseMock = [new AxelarChainObjectMock()];
    const getTokensResponseMock = [new AxelarInterchainTokenObjectMock()];

    beforeEach(() => {
        configManagerMock.clearMocks();

        // Mock config manager
        configManagerMock.get.mockImplementation((key: string) => {
            if (key === "axelar.apiUrl") {
                return axelarApiUrlMock;
            } else if (key === "axelar.url") {
                return axelarUrlMock;
            } else if (key === "axelar.extraChains") {
                return [];
            } else if (key === "axelar.chainIds") {
                return { [getChainsResponseMock[0].id]: true };
            } else if (key === "axelar.additionalChainData") {
                return {};
            } else if (key === "axelar.extraTokens") {
                return [];
            } else if (key === "axelar.additionalTokenData") {
                return {};
            } else if (key === "axelar.interchainTokenServiceContract") {
                return "0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C";
            } else if (key === "axelar.gmpUrl") {
                return axelarGmpUrlMock;
            }
            return undefined;
        });

        axelarService = new AxelarService(configManagerMock);
    });

    describe("getChains", () => {
        it("should return the chains supported by Axelar", async () => {
            const fetchResultMock = new (mockify<Response>({
                ok: true,
                json: () => Promise.resolve(getChainsResponseMock),
            }))();
            const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValueOnce(fetchResultMock);

            const chains = await axelarService.getChains();

            expect(fetchSpy).toHaveBeenCalledWith(`${configManagerMock.get("axelar.apiUrl")}/getChains`, {
                headers: { "Content-Type": "application/json" },
            });
            expect(chains).toEqual(getChainsResponseMock.map((chain) => new AxelarChain(chain, axelarUrlMock).toChain()));
        });

        it("should throw an error if the response is not ok", async () => {
            const fetchResultMock = new (mockify<Response>({
                ok: false,
            }))();
            jest.spyOn(global, "fetch").mockResolvedValueOnce(fetchResultMock);

            await expect(axelarService.getChains()).rejects.toThrow(new ServiceError(AxelarErrors.GET_CHAINS_FETCH_ERROR));
        });

        it("should throw an error if the response is not parseable", async () => {
            const fetchResultMock = new (mockify<Response>({
                ok: true,
                json: () => Promise.reject("not a json"),
            }))();
            jest.spyOn(global, "fetch").mockResolvedValueOnce(fetchResultMock);

            await expect(axelarService.getChains()).rejects.toThrow(new ServiceError(AxelarErrors.GET_CHAINS_PARSE_ERROR));
        });
    });

    describe("getBridgeTokens", () => {
        const chainMock = new ChainMock();
        const otherChainMock = new ChainMock();

        it("should return bridge tokens", async () => {
            const fetchResultMock = new (mockify<Response>({
                ok: true,
                json: () => Promise.resolve(getTokensResponseMock),
            }))();
            const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValueOnce(fetchResultMock);

            const chains = await axelarService.getBridgeTokens(chainMock, otherChainMock);

            expect(fetchSpy).toHaveBeenCalledWith(`${configManagerMock.get("axelar.apiUrl")}/getChains`, {
                headers: { "Content-Type": "application/json" },
            });
            expect(chains).toEqual(
                getTokensResponseMock.map((token) =>
                    new AxelarInterchainToken(token, configManagerMock.get("axelar.url")).toBridgeToken(chainMock),
                ),
            );
        });

        it("should throw an error if the response is not ok", async () => {
            const fetchResultMock = new (mockify<Response>({
                ok: false,
            }))();
            jest.spyOn(global, "fetch").mockResolvedValueOnce(fetchResultMock);

            await expect(axelarService.getBridgeTokens(chainMock, otherChainMock)).rejects.toThrow(
                new ServiceError(AxelarErrors.GET_BRIDGE_TOKENS_FETCH_ERROR),
            );
        });

        it("should throw an error if the response is not parseable", async () => {
            const fetchResultMock = new (mockify<Response>({
                ok: true,
                json: () => Promise.reject("not a json"),
            }))();
            jest.spyOn(global, "fetch").mockResolvedValueOnce(fetchResultMock);

            await expect(axelarService.getBridgeTokens(chainMock, otherChainMock)).rejects.toThrow(
                new ServiceError(AxelarErrors.GET_BRIDGE_TOKENS_PARSE_ERROR),
            );
        });
    });

    describe("getPaginatedTransfers", () => {
        it("should return the paginated transfers", async () => {
            const axelarGMPTransfersObjectMock = new AxelarGMPTransfersObjectMock();

            const fetchResultMock = new (mockify<Response>({
                ok: true,
                json: () => Promise.resolve(axelarGMPTransfersObjectMock),
            }))();
            const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValueOnce(fetchResultMock);

            jest.spyOn(axelarService, "getChainById").mockResolvedValue(new ChainMock());

            const paginatedTransfers = await axelarService.getPaginatedTransfers(1, 10);

            expect(fetchSpy).toHaveBeenCalledWith(`${axelarGmpUrlMock}/searchGMP`, {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({
                    size: 10,
                    from: 0,
                    sourceChain: undefined,
                    destinationChain: undefined,
                    contractMethod: AxelarGMPTransferContractMethod.INTERCHAIN_TRANSFER,
                    senderAddress: undefined,
                }),
            });

            expect(paginatedTransfers.items).toHaveLength(axelarGMPTransfersObjectMock.data.length);
        });

        it("should throw an error if the response is not ok", async () => {
            const fetchResultMock = new (mockify<Response>({
                ok: false,
            }))();
            jest.spyOn(global, "fetch").mockResolvedValueOnce(fetchResultMock);

            await expect(axelarService.getPaginatedTransfers(1, 10)).rejects.toThrow(
                new ServiceError(AxelarErrors.GET_PAGINATED_TRANSFERS_FETCH_ERROR),
            );
        });

        it("should throw an error if the response is not parseable", async () => {
            const fetchResultMock = new (mockify<Response>({
                ok: true,
                json: () => Promise.reject("not a json"),
            }))();
            jest.spyOn(global, "fetch").mockResolvedValueOnce(fetchResultMock);

            await expect(axelarService.getPaginatedTransfers(1, 10)).rejects.toThrow(
                new ServiceError(AxelarErrors.GET_PAGINATED_TRANSFERS_PARSE_ERROR),
            );
        });
    });
});
