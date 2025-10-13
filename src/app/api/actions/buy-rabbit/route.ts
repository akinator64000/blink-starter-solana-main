// file: src/app/api/actions/buy-rabbit/route.ts
import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ActionError,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from "@solana/actions";
import { PublicKey } from "@solana/web3.js";

const headers = {
  ...ACTIONS_CORS_HEADERS,
  "x-blockchain-ids": BLOCKCHAIN_IDS.mainnet,
  "x-action-version": "2.4",
};

const RABBIT_MINT = process.env.NEXT_PUBLIC_RABBIT_MINT!;
const LITE = "https://lite-api.jup.ag/swap/v1"; // 👈 Lite endpoints

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
        {
          type: "transaction",
          label: "0.1 SOL",
          href: `/api/actions/buy-rabbit?amount=0.1`,
        },
        {
          type: "transaction",
          label: "0.5 SOL",
          href: `/api/actions/buy-rabbit?amount=0.5`,
        },
        {
          type: "transaction",
          label: "1 SOL",
          href: `/api/actions/buy-rabbit?amount=1`,
        },
        {
          type: "transaction",
          label: "Buy",
          href: `/api/actions/buy-rabbit?amount={amount}`,
          parameters: [
            {
              name: "amount",
              label: "Enter a custom SOL amount",
              type: "number",
            },
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
    const amountSOL = Number(url.searchParams.get("amount") ?? "0.1");
    if (!RABBIT_MINT || !Number.isFinite(amountSOL) || amountSOL <= 0) {
      return new Response(
        JSON.stringify({
          message: "Missing/invalid mint or amount",
        } satisfies ActionError),
        { status: 400, headers }
      );
    }

    const body: ActionPostRequest = await req.json();
    if (!body.account) {
      return new Response(
        JSON.stringify({
          message: "Missing account header/body",
        } satisfies ActionError),
        { status: 400, headers }
      );
    }
    const userPublicKey = new PublicKey(body.account);

    // 1) Quote (Lite)
    const inLamports = Math.round(amountSOL * 1e9);
    const quoteUrl = new URL(`${LITE}/quote`);
    quoteUrl.searchParams.set(
      "inputMint",
      "So11111111111111111111111111111111111111112"
    ); // SOL
    quoteUrl.searchParams.set("outputMint", RABBIT_MINT);
    quoteUrl.searchParams.set("amount", String(inLamports));
    quoteUrl.searchParams.set("slippageBps", "100"); // 1%

    const quoteRes = await fetch(quoteUrl, { cache: "no-store" });
    if (!quoteRes.ok) {
      const txt = await quoteRes.text();
      return new Response(
        JSON.stringify({
          message: `Quote failed: ${txt}`,
        } satisfies ActionError),
        { status: 502, headers }
      );
    }
    const quote = await quoteRes.json();

    // 2) Swap (Lite)
    const swapRes = await fetch(`${LITE}/swap`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: userPublicKey.toBase58(),
        wrapAndUnwrapSol: true, // 👈 CORRECT KEY
        dynamicComputeUnitLimit: true, // 👌 safe defaults
        prioritizationFeeLamports: "auto",
        asLegacyTransaction: false,
      }),
    });
    if (!swapRes.ok) {
      const txt = await swapRes.text();
      return new Response(
        JSON.stringify({
          message: `Swap failed: ${txt}`,
        } satisfies ActionError),
        { status: 502, headers }
      );
    }
    const swap = await swapRes.json();
    if (!swap?.swapTransaction) {
      return new Response(
        JSON.stringify({
          message: "Swap transaction missing",
        } satisfies ActionError),
        { status: 502, headers }
      );
    }

    const response: ActionPostResponse = {
      type: "transaction",
      transaction: swap.swapTransaction, // base64
      message: `Swap ~${amountSOL} SOL → RABBIT`,
    };
    return Response.json(response, { status: 200, headers });
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        message: e?.message ?? "unknown",
      } satisfies ActionError),
      { status: 500, headers }
    );
  }
};
