// file: src/app/api/actions/buy-rabbit/route.ts

import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ActionError,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from "@solana/actions";

import {
  Connection,
  PublicKey,
  VersionedTransaction,
} from "@solana/web3.js";

const headers = {
  ...ACTIONS_CORS_HEADERS,
  "x-blockchain-ids": BLOCKCHAIN_IDS.mainnet,
  "x-action-version": "2.4",
};

const RABBIT_MINT = process.env.NEXT_PUBLIC_RABBIT_MINT!;
const RPC = "https://api.mainnet-beta.solana.com";

export const OPTIONS = async () => new Response(null, { headers });

export const GET = async (req: Request) => {
  const response: ActionGetResponse = {
    type: "action",
    icon: `${new URL("/buy-rabbit.jpg", req.url).toString()}`,
    label: "$RABBIT",
    title: "Buy RABBIT",
    description: "Swap SOL for RABBIT token using Jupiter",
    links: {
      actions: [
        { type: "transaction", label: "0.1 SOL", href: `/api/actions/buy-rabbit?amount=0.1` },
        { type: "transaction", label: "0.5 SOL", href: `/api/actions/buy-rabbit?amount=0.5` },
        { type: "transaction", label: "1 SOL", href: `/api/actions/buy-rabbit?amount=1` },
        {
          type: "transaction",
          label: "Buy",
          href: `/api/actions/buy-rabbit?amount={amount}`,
          parameters: [
            { name: "amount", label: "Enter a custom SOL amount", type: "number" },
          ],
        },
      ],
    },
  };

  return new Response(JSON.stringify(response), { status: 200, headers });
};

export const POST = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const amountSOL = parseFloat(url.searchParams.get("amount") || "0.1");

    if (!RABBIT_MINT || !amountSOL) throw new Error("Missing mint or amount");

    const body: ActionPostRequest = await req.json();
    const userPublicKey = new PublicKey(body.account);
    const connection = new Connection(RPC);

    const quoteRes = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${RABBIT_MINT}&amount=${Math.floor(amountSOL * 1e9)}&slippageBps=100`);
    const quote = await quoteRes.json();

    const swapTxRes = await fetch("https://quote-api.jup.ag/v6/swap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userPublicKey: userPublicKey.toBase58(),
        wrapUnwrapSOL: true,
        quoteResponse: quote,
        asLegacyTransaction: false,
      }),
    });

    const swapData = await swapTxRes.json();

    if (!swapData.swapTransaction) throw new Error("Swap transaction missing");

    const serialized = swapData.swapTransaction; // base64 Jupiter format

    const response: ActionPostResponse = {
      type: "transaction",
      transaction: serialized,
    };

    return Response.json(response, { status: 200, headers });
  } catch (err) {
    console.error("Error in buy-rabbit POST:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    const error: ActionError = { message };
    return new Response(JSON.stringify(error), { status: 500, headers });
  }
};
