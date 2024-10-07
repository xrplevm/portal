import { CoreConfig } from "./types";

/**
 * Static config which is the base of the config.
 * It can be overridden by the ConfigManager.
 */
export const config: CoreConfig = {
    version: 0,
    projectName: "portal",
    publicUrl: "/",
    backendUrl: "https://bridge.aws.peersyst.tech",
    theme: "default",
    walletProviders: {
        metamask: {
            providerId: "metamask",
            name: "Metamask",
            imageUrl: "./assets/wallets/metamask.png",
            chainType: "evm",
        },
        xrplFaucet: {
            providerId: "xrplFaucet",
            name: "XRPL Faucet Wallet",
            imageUrl: "./assets/wallets/xrplFaucet.png",
            chainType: "xrp",
        },
    },
    maxNumberDecimals: 6,
    balanceRefetchInterval: 10000,
    txValidationPolling: {
        delay: 3000,
        maxIterations: 10,
    },
    peersystUrl: "https://peersyst.com/",
    axelarUrl: "https://axelar.network/",
    posthog: {
        apiKey: "phc_2qUK15rvNyW5iKbLw2pmJpy6P6O1PvMWWbr39QWGvLK",
        host: "https://eu.posthog.com",
    },
    footerLinks: {
        discord: "https://discord.gg/xrplevm",
        x: "https://twitter.com/Peersyst",
        featureRequest: "mailto:info@peersyst.com?subject=[XRPL EVM Feature Request]",
    },
    featuredChains: ["xrpl-evm-sidechain"],
    axelar: {
        url: "https://devnet-amplifier.axelarscan.io", //"https://axelarscan.io"
        apiUrl: "https://devnet-amplifier.api.axelarscan.io/api", //"https://api.axelarscan.io/api",
        gmpUrl: "https://devnet-amplifier.api.axelarscan.io/gmp", //"https://api.axelarscan.io/gmp",
        interchainTokenServiceContract: "0x144c3d7A5f5198EF3B46A8258b35E903cf197A66",
        chainIds: {
            // xrpl: true,
            // ethereum: true,
            // binance: true,
            // polygon: true,
            // avalanche: true,
            // optimism: true,
            // fantom: true,
            "core-ethereum": true,
            "xrpl-evm-sidechain": true,
            "avalanche-fuji": true,
            "solana-devnet": true,
            "starknet-devnet": true,
            "core-optimism": true,
        },
        additionalChainData: {
            xrpl: {
                image: "https://peersyst-public-production.s3.eu-west-1.amazonaws.com/cc4278ab-39f5-4a67-9042-5e6cebdef549.png",
                endpoints: {
                    ws: ["wss://s.devnet.rippletest.net:51233"],
                    faucet: ["https://faucet.devnet.rippletest.net/accounts"],
                },
            },
            "xrpl-evm-sidechain": {
                image: "https://peersyst-public-production.s3.eu-west-1.amazonaws.com/76dcd079-8a70-41d4-ad72-53098813e2e9.png",
                chain_id: 1440002,
                chain_name: "xrpl-evm-devnet",
                short_name: "XRPL EVM",
                name: "XRPL EVM Devnet",
                chain_type: "evm",
                color: "#111112",
                native_token: {
                    name: "XRP",
                    symbol: "XRP",
                    decimals: 18,
                },
                endpoints: {
                    rpc: ["https://rpc-evm-sidechain.xrpl.org"],
                },
                explorer: {
                    name: "XRPL EVM Explorer",
                    url: "https://explorer.xrplevm.org",
                    icon: "https://peersyst-public-production.s3.eu-west-1.amazonaws.com/c01b678f-4272-41fc-8f39-e50a17421dcf.png",
                    block_path: "/block/{block}",
                    address_path: "/address/{address}",
                    contract_path: "/token/{address}",
                    transaction_path: "/tx/{tx}",
                },
                no_inflation: false,
                no_tvl: false,
                interchain_token_service_contract: "0x43F2ccD4E27099b5F580895b44eAcC866e5F7Bb1",
            },
        },
        extraChains: [],
        additionalTokenData: {},
        extraTokens: [
            {
                id: "0x6ae9922afe30a79c7910c5e0ee738f104cf3b814426b9a39701ed32ee67593f0",
                symbol: "XRP",
                name: "XRP",
                decimals: 18,
                image: "https://peersyst-public-production.s3.eu-west-1.amazonaws.com/cbee4de2-1152-4555-9eb8-ad4023ac35bc.png",
                coingecko_id: "",
                addresses: [],
                native_chain: "xrpl-evm-sidechain",
                chains: {
                    "avalanche-fuji": {
                        tokenAddress: "0xa7bAa2FE1df377147aaf49858b399F8C2564e8A4",
                        symbol: "axlXRP",
                        name: "Axelar XRP",
                        tokenManager: "",
                        tokenManagerType: "",
                    },
                    "xrpl-evm-sidechain": {
                        tokenAddress: "0xD4949664cD82660AaE99bEdc034a0deA8A0bd517",
                        symbol: "XRP",
                        name: "XRP",
                        tokenManager: "",
                        tokenManagerType: "",
                    },
                },
            },
            {
                id: "0x85f75bb7fd0753565c1d2cb59bd881970b52c6f06f3472769ba7b48621cd9d23",
                symbol: "PDK",
                name: "PIDK",
                decimals: 6,
                image: "https://play-lh.googleusercontent.com/u_C8ucNEn2hOewCC1iRFwNVJ_pmLb7yOqlnGFnARFoLugdcY4O85o2SsObZVm-oTTs0R",
                coingecko_id: "",
                addresses: [],
                native_chain: "avalanche-fuji",
                chains: {
                    "avalanche-fuji": {
                        tokenAddress: "0x7906c5cEce267c00c2d33F1c69f86CAB4C9E3061",
                        symbol: "PDK",
                        name: "PIDK",
                        tokenManager: "",
                        tokenManagerType: "",
                    },
                    "xrpl-evm-sidechain": {
                        tokenAddress: "0x20937978F265DC0C947AA8e136472CFA994FE1eD",
                        symbol: "PDK",
                        name: "PIDK",
                        tokenManager: "",
                        tokenManagerType: "",
                    },
                },
            },
        ],
    },
    bridgeExplorer: {
        name: "Axelarscan Devnet Amplifier",
        url: "https://devnet-amplifier.axelarscan.io",
        icon: "https://devnet-amplifier.axelarscan.io/logos/assets/axl.svg",
        transferPath: "/transfer/{hash}",
    },

    xumm: {
        statusInterval: 3000,
        maxNumberOfRetries: 30,
    },
    attestationsPolling: {
        delay: 5000,
        maxIterations: 100,
    },
    destinationCanReceiveRefetchInterval: 20000,
    destinationIsActiveRefetchInterval: 10000,
    explorerPaths: {
        xrp: {
            account: "accounts",
            transaction: "transactions",
        },
        evm: {
            account: "address",
            transaction: "tx",
        },
    },
};
