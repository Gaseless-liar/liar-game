import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { StarknetConfig, InjectedConnector } from "@starknet-react/core";

function MyApp({ Component, pageProps }: AppProps) {
  const connectors = [
    new InjectedConnector({ options: { id: "braavos" } }),
    new InjectedConnector({ options: { id: "argentX" } }),
  ];

  return (
    <>
      <StarknetConfig connectors={connectors}>
        <Head>
          <title>Gaseless Liar</title>
          <meta name="description" content="Gaseless Liar" />
          <link rel="icon" href="/ImperiumWarsLogo.png" />
        </Head>
        <Component {...pageProps} />
      </StarknetConfig>
    </>
  );
}

export default MyApp;
