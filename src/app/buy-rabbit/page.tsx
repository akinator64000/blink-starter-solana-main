import ClientBlink from "./ClientBlink";

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

export default function Page() {
  return <ClientBlink />;
}
