import { BurnRecord, BurnQueryDto } from "@/types";
import { type Address } from "viem";

const API_URL = "http://127.0.0.1:5001/blockus1/us-central1/api";
const PROJECT_ID = "YiodrSuXgHaE3623ilMGacKoehVq";

interface BurnProof {
  type: "evm";
  txHash: string;
}

interface BurnRegistrationData {
  tokenId: string;
  chain: string;
  walletAddress: string;
  burnProof: BurnProof;
  amount: number;
}

export async function registerBurn(data: {
  tokenId: string;
  tokenAddress: Address;
  txHash: string;
  walletAddress: Address;
}): Promise<BurnRecord> {
  const burnData: BurnRegistrationData = {
    tokenId: data.tokenId,
    chain: "polygon", // Currently hardcoded to polygon
    walletAddress: data.walletAddress,
    burnProof: {
      type: "evm",
      txHash: data.txHash,
    },
    amount: 1, // Default to 1 for ERC721
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
