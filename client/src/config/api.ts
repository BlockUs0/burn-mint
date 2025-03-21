import { Address } from "viem";

export const API_CONFIG = {
  URL: import.meta.env.VITE_API_URL || "https://api-staging.blockus.net",
  PROJECT_ID: import.meta.env.VITE_PROJECT_ID || "2IzYY1TZCqE6sDT6qHsMTtqszUAL",
  ALCHEMY_KEY:
    import.meta.env.VITE_ALCHEMY_API_KEY || "Eb5YzZMR9-i55viNBnAvUpwN11ko7YR3",
  CONTRACTS: {
    NFT_ADDRESS: "0x85be9de7a369850a964616a2c04d79000d168dea" as Address,
    ZERO_ADDRESS: "0x0000000000000000000000000000000000000000" as Address,
    BURN_ADDRESS: "0x71B81e78F08c3f2d799e3C1d5D4cE877ab0c8804" as Address,
  },
} as const;
