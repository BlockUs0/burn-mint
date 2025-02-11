import { Address, Hash } from "viem";

// const API_URL = "https://api-staging.blockus.net";
const API_URL = "http://127.0.0.1:5001/blockus1/us-central1/api";
const PROJECT_ID = "2IzYY1TZCqE6sDT6qHsMTtqszUAL";

export type ChallengeResponse = {
  code: string;
  expiresAt: Date;
  address: string;
};

export type LoginResponse = {
  accessToken: string;
};

export type WalletAddressResponse = {
  address: string;
  chain: string;
  nonCustodial: boolean;
  balance: any[];
  userId: string;
};

export async function getWeb3Challenge(
  address: Address,
): Promise<ChallengeResponse> {
  console.log("Requesting challenge for address:", address);

  const URL = "/v1/auth/challenge?type=web3";
  const response = await fetch(`${API_URL}${URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-PROJECT-ID": PROJECT_ID,
    },
    body: JSON.stringify({
      address,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Challenge request failed:", error);
    throw new Error(`Failed to get challenge: ${error}`);
  }

  const data = await response.json();
  console.log("Challenge response:", data);
  return data;
}

export async function getWalletAddress(
  chain: string,
): Promise<WalletAddressResponse> {
  const accessToken = localStorage.getItem("blockus_access_token");
  if (!accessToken) {
    throw new Error("No access token found");
  }

  console.log("Fetching wallet address for chain:", chain);

  const URL = `/v1/players/wallets/getAddress?chain=${chain}`;
  const response = await fetch(`${API_URL}${URL}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-ACCESS-TOKEN": accessToken,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Get wallet address failed:", error);
    throw new Error(`Failed to get wallet address: ${error}`);
  }

  const data = await response.json();
  console.log("Wallet address response:", data);

  // Store userId in localStorage for later use
  if (data.userId) {
    localStorage.setItem("blockus_user_id", data.userId);
  }

  return data;
}

export async function web3Login({
  address,
  signature,
  chain,
}: {
  address: Address;
  signature: Hash;
  chain: string;
}): Promise<LoginResponse> {
  console.log("Sending login request with params:", {
    address,
    signature,
    chain,
  });

  const URL = "/v1/players/login?type=web3";
  const response = await fetch(`${API_URL}${URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-PROJECT-ID": PROJECT_ID,
    },
    body: JSON.stringify({ address, signature, chain }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Login failed:", errorText);
    throw new Error(`Authentication failed: ${errorText}`);
  }

  const data = await response.json();
  console.log("Login response:", data);

  // Store the access token in localStorage
  if (data.accessToken) {
    localStorage.setItem("blockus_access_token", data.accessToken);
  } else {
    console.error("No access token received in login response");
    throw new Error("No access token received");
  }

  return data;
}
