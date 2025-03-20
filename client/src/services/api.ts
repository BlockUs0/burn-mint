import { BurnRecord, BurnQueryDto } from "@/types";
import { type Address } from "viem";

import { API_CONFIG } from "@/config/api";
const API_URL = API_CONFIG.URL;

interface BurnProof {
  type: "evm";
  txHash: string;
}

interface BurnRegistrationData {
  tokenIds: string[];
  chain: string;
  walletAddress: string;
  burnProof: BurnProof;
  collectionContractAddress: string;
}

export type MintResponse = {
  success: boolean;
  transactionHash?: string;
};

export async function mintNFT(
  collectionId: string,
  tokenId: string,
  quantity: number = 1,
): Promise<MintResponse> {
  console.log("Minting NFT with params:", { collectionId, tokenId, quantity });

  const URL = `/v1/players/wallets/collections/${collectionId}/nfts/${tokenId}/mint`;
  const accessToken = localStorage.getItem("blockus_access_token");

  if (!accessToken) {
    throw new Error("No access token found");
  }
  const response = await fetch(`${API_URL}${URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ quantity }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Mint failed:", errorText);
    throw new Error(`Mint failed: ${errorText}`);
  }

  const data = await response.json();
  console.log("Mint response:", data);
  return data;
}

export async function registerBurn(data: {
  tokenIds: string[];
  tokenAddress: Address;
  txHash: string;
  walletAddress: Address;
}): Promise<BurnRecord> {
  const burnData: BurnRegistrationData = {
    tokenIds: data.tokenIds,
    chain: "polygon",
    walletAddress: data.walletAddress,
    burnProof: {
      type: "evm",
      txHash: data.txHash,
    },
    collectionContractAddress: data.tokenAddress,
  };

  const accessToken = localStorage.getItem("blockus_access_token");
  if (!accessToken) {
    throw new Error("No access token found. Please authenticate first.");
  }

  const response = await fetch(`${API_URL}/v1/burns/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(burnData),
  });

  if (!response.ok) {
    throw new Error("Failed to register burn");
  }

  return response.json();
}

export async function getBurns(
  query: BurnQueryDto & { walletAddress?: Address },
) {
  const accessToken = localStorage.getItem("blockus_access_token");
  if (!accessToken) {
    throw new Error("No access token found. Please authenticate first.");
  }

  const headers = new Headers({
    "X-ACCESS-TOKEN": "",
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  });

  // Construct URL with query parameters
  const url = new URL(`${API_URL}/v1/burns`);
  if (query.walletAddress) {
    url.searchParams.append("walletAddress", query.walletAddress);
  }

  url.searchParams.append("limit", "20");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers,
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch burns");
  }
  return response.json();
}

export type AllowlistSignatureResponse = {
  signature: string;
};

export async function getMintSignature({
  collectionId,
  tokenId,
  walletAddress,
  chainId,
  contractAddress,
  quantity = 1,
}: {
  collectionId: string;
  tokenId: string;
  walletAddress: string;
  chainId: number;
  contractAddress: string;
  quantity?: number;
}): Promise<AllowlistSignatureResponse> {
  const accessToken = localStorage.getItem("blockus_access_token");
  if (!accessToken) {
    throw new Error("No access token found");
  }

  // Validate quantity is a positive integer
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be a positive integer");
  }

  // Build URL with query parameters
  const url = new URL(
    `${API_URL}/v1/players/wallets/collections/${collectionId}/nfts/${tokenId}/mint-signature`
  );

  // Add query parameters
  url.searchParams.append("wallet", walletAddress);
  url.searchParams.append("chainId", chainId.toString());
  url.searchParams.append("contractAddress", contractAddress);
  url.searchParams.append("quantity", Math.floor(quantity).toString()); // Ensure integer

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      "X-ACCESS-TOKEN": accessToken,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Signature fetch failed:", errorText);
    throw new Error(`Failed to fetch mint signature: ${errorText}`);
  }

  return response.json();
}