"use client";

import { Blink, useBlink } from "@dialectlabs/blinks";
import { useBlinkSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana";
import "@dialectlabs/blinks/index.css";

export const metadata = {
  title: "Buy RABBIT",
  description: "Swap SOL for RABBIT token using Jupiter",
  openGraph: {
    title: "Buy RABBIT",
    description: "Swap SOL for RABBIT token using Jupiter",
    url: "https://blinks-rabbit.vercel.app/buy-rabbit",
    siteName: "Blinks Rabbit",
    images: [
      {
        url: "https://blinks-rabbit.vercel.app/buy-rabbit-og.png",
        width: 1200,
        height: 630,
        alt: "Buy RABBIT",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy RABBIT",
    description: "Swap SOL for RABBIT token using Jupiter",
    images: ["https://blinks-rabbit.vercel.app/buy-rabbit-og.png"],
  },
};

export default function BuyRabbit() {
  const blinkApiUrl = "https://blinks-rabbit.vercel.app/api/actions/buy-rabbit";

  const { adapter } = useBlinkSolanaWalletAdapter(
    "https://api.mainnet-beta.solana.com"
  );

  const { blink, isLoading } = useBlink({ url: blinkApiUrl });

  return (
    <main className="flex items-center justify-center min-h-screen">
      {isLoading || !blink ? (
        <span>Loading</span>
      ) : (
        <div className="w-full max-w-lg">
          <Blink
            blink={blink}
            adapter={adapter}
            securityLevel="all"
            stylePreset="x-dark"
          />
        </div>
      )}
    </main>
  );
}
