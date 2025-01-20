
import { Chain, mainnet, sepolia, goerli } from "viem/chains";

export type NetworkConfig = {
  chain: Chain;
  alchemyUrl: string;
  displayName: string;
  icon: string;
};

export const networks: Record<number, NetworkConfig> = {
  [mainnet.id]: {
    chain: mainnet,
    alchemyUrl: "https://eth-mainnet.g.alchemy.com/v2",
    displayName: "Ethereum",
    icon: "ETH",
  },
  [sepolia.id]: {
    chain: sepolia,
    alchemyUrl: "https://eth-sepolia.g.alchemy.com/v2",
    displayName: "Sepolia",
    icon: "SEP",
  },
  [goerli.id]: {
    chain: goerli,
    alchemyUrl: "https://eth-goerli.g.alchemy.com/v2",
    displayName: "Goerli",
    icon: "GOR",
  },
};
