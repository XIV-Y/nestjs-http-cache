import fetchWithETag from "@/app/utils/fetch-with-etag";
import { Inter } from "next/font/google";
import { SWRConfig } from "swr";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <SWRConfig
          value={{
            fetcher: fetchWithETag,
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
