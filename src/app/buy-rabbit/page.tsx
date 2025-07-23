"use client";

import { Blink, useBlink } from "@dialectlabs/blinks";
import { useBlinkSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana";
import "@dialectlabs/blinks/index.css";

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
