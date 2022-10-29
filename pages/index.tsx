import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Button from "../components/UI/button";
import styles from "../styles/index.module.css";
import { useConnectors, useAccount } from "@starknet-react/core";
import Wallets from "../components/UI/wallets";

const Home: NextPage = () => {
  const router = useRouter();
  const [hasWallet, setHasWallet] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { status } = useAccount();
  const { available, connect } = useConnectors();

  useEffect(() => {
    if (!isConnected) {
      available.length === 1 ? connect(available[0]) : setHasWallet(true);
    } else {
      router.push("/play");
    }
  }, [isConnected]);

  useEffect(() => {
    status === "connected" ? setIsConnected(true) : setIsConnected(false);
  }, [status]);

  return (
    <div className={styles.container}>
      <div className={styles.blackFilter}></div>
      <div className={styles.main}>
        <div className="centerContainer">
          <h1 className={styles.homeTitle}>Gaseless Liar</h1>
          <Button
            onClick={
              isConnected
                ? () => router.push("/play")
                : () => setHasWallet(true)
            }
          >
            Start playing
          </Button>
        </div>
      </div>
      <Wallets closeWallet={() => setHasWallet(false)} hasWallet={hasWallet} />
    </div>
  );
};

export default Home;
