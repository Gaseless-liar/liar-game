import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import Button from "../components/UI/button";
import styles from "../styles/index.module.css";
import Wallets from "../components/UI/wallets";
import { getStarknet } from "get-starknet";

const Home: NextPage = () => {
  const router = useRouter();
  const [hasWallet, setHasWallet] = useState<boolean>(false);

  const connectWallet = async () => {
    const _starknet = await getStarknet();
    await _starknet.enable({ showModal: true });
    if (_starknet.isConnected === true) router.push("/play");
  };


  return (
    <div className={styles.container}>
      <div className={styles.blackFilter}></div>
      <div className={styles.main}>
        <div className="centerContainer">
          <h1 className={styles.homeTitle}>Gaseless Liar</h1>
          <Button
            onClick={() => connectWallet()
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
