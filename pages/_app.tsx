import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { StarknetProvider, InjectedConnector } from "@starknet-react/core";

function MyApp({ Component, pageProps }: AppProps) {
  const connectors = [
    new InjectedConnector({ options: { id: "braavos" } }),
    new InjectedConnector({ options: { id: "argentX" } }),
  ];

  return (
    <>
      <StarknetProvider connectors={connectors}>
        <Head>
          <title>Gaseless Liar</title>
          <meta name="description" content="Gaseless Liar" />
        </Head>
        <Component {...pageProps} />
      </StarknetProvider>
    </>
  );
}

export default MyApp;
