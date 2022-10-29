/* eslint-disable @next/next/no-img-element */
import { Modal } from "@mui/material";
import type { NextPage } from "next";
import Button from "../components/UI/button";
import styles from "../styles/play.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { createLibp2p } from "libp2p";
import { webSockets } from "@libp2p/websockets";
import { webRTCStar } from "@libp2p/webrtc-star";
import { Noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";
import { bootstrap } from "@libp2p/bootstrap";
import { floodsub } from "@libp2p/floodsub";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";

const Play: NextPage = () => {
  //Front end Data
  const allCards: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const [modalCardToTell, setModalCardToTell] = useState<boolean>(false);
  const [cardToDeposit, setCardToDeposit] = useState<undefined | number>();
  const [cardToAnnounce, setCardToAnnounce] = useState<any>({
    index: 0,
    card: 0,
  });

  // Data needed for the game
  const [isYourTurn, setIsYourTurn] = useState<boolean>(false);
  const playerCards: number[] = allCards;
  const playerDepositedCards: number[] = [];
  const opponentDepositedCards: string[] = [];
  const [lastAnnouncedCard, setLastAnnouncedCard] = useState<
    number | undefined
  >();
  const [shouldSendFraudProof, setShouldSendFraudProof] =
    useState<boolean>(false);

  function draw(): void {
    // générer un nb alétoire
    const rn1 = Math.floor(Math.random() * 12);

    // reveal le hash et demander à l'adversaire de générer un nb alétoire

    // recevoir le nb alétoire de l'adversaire
    const rn2 = 1;

    playerCards.push((rn1 + rn2) % 12);
  }

  function depositCard(): void {
    removeCard(cardToDeposit, playerCards);  
    playerDepositedCards.push(cardToDeposit);
    setLastAnnouncedCard(cardToAnnounce);
    sendValue(cardToAnnounce);
    sendValue(depositedHash); // est ce qu'on recalcule le hash ?
    // change turn
  }

  function tellThatHeIsLying(): void {
    const revealed = accuseOpponent();
    if (revealed >= lastAnnouncedCard) {
        retrieveCards();
    } else {
        roundWon();
        setLastAnnouncedCard(0);
        playerDepositedCards = [];
    }
    // envoie de fraud proof si jamais pas de reponse
  }

  function retrieveCards(): void {
    // demander opponentDepositedCards et vérifier que ces valeurs sont cohérentes avec les hashs de opponentDepositedCards
    const opponentDepositedCardsValues = getValue();
    verifyCardsIntegrity(opponentDepositedCardsValues, opponentDepositedCards);
    playerCards.concat(opponentDepositedCards);
    
    // changer tour de jeu
  }

  function onCardDepositChoose(card: number): void {
    setModalCardToTell(true);
    setCardToDeposit(card);
  }

  function onCardAnnouncedChoose(card: number, index: number): void {
    setCardToAnnounce({ index, card });
  }

  // -------------- libP2P management -----------------------------

  const router = useRouter();
  const wrtcStar = webRTCStar();
  const [isInit, setIsInit] = useState(false);
  const [libp2p, setLibp2p] = useState<any>(null);
  const [roomId, setRoomId] = useState((router.query.room as string) ?? "");
  const [peerId, setPeerId] = useState((router.query.id as string) ?? "");
  const [otherPlayer, setOtherPlayer] = useState("");
  const [roomUri, setRoomUri] = useState("");

  const joinGame = async (otherPlayerId: string) => {
    var bootstrapList = [
      "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
      "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
      "/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp",
      "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
      "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
      `/ip4/127.0.0.1/tcp/9090/http/p2p-webrtc-direct/p2p/${otherPlayerId}`,
    ];

    const libp2p = await createLibp2p({
      addresses: {
        listen: [
          "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
          "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
        ],
      },
      transports: [webSockets(), wrtcStar.transport],
      connectionEncryption: [() => new Noise()],
      streamMuxers: [mplex()],
      pubsub: floodsub(),
      peerDiscovery: [
        wrtcStar.discovery,
        bootstrap({
          list: bootstrapList,
        }),
      ],
    });

    console.log("libp2p", libp2p);
    await libp2p.start();
    setLibp2p(libp2p);
    setPeerId(libp2p.peerId.toString());
    setIsInit(true);
  };

  const initGame = async () => {
    console.log("initializing");

    var bootstrapList = [
      "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
      "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
      "/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp",
      "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
      "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
    ];

    const libp2p = await createLibp2p({
      addresses: {
        listen: [
          "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
          "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
        ],
      },
      transports: [webSockets(), wrtcStar.transport],
      connectionEncryption: [() => new Noise()],
      streamMuxers: [mplex()],
      pubsub: floodsub(),
      peerDiscovery: [
        wrtcStar.discovery,
        bootstrap({
          list: bootstrapList,
        }),
      ],
    });

    console.log("libp2p", libp2p);
    await libp2p.start();
    setLibp2p(libp2p);
    setPeerId(libp2p.peerId.toString());

    var topic = "room_" + libp2p.peerId.toString();
    setRoomId(topic);
    setRoomUri(
      `http://localhost:3000/play?id=${libp2p.peerId.toString()}&room=${topic}`
    );

    setIsInit(true);
  };

  useEffect(() => {
    if (
      router.query &&
      router.query.id &&
      router.query.room &&
      !roomId &&
      !peerId &&
      !isInit
    ) {
      setRoomId(router.query.room as string);
      setOtherPlayer(router.query.id as string);
      joinGame(router.query.id as string);
    }
  }, [roomId, peerId, router.query]);

  useEffect(() => {
    if (libp2p && isInit) {
      // Listen for new peers
      libp2p.addEventListener("peer:discovery", (evt: any) => {
        const peer = evt.detail;
        // console.log(`Found peer ${peer.id.toString()}`)

        // dial them when we discover them
        libp2p.dial(evt.detail.id).catch((err: any) => {
          // console.log(`Could not dial ${evt.detail.id}`, err)
        });
      });

      // Listen for new connections to peers
      libp2p.connectionManager.addEventListener("peer:connect", (evt: any) => {
        const connection = evt.detail;
        // console.log(`Connected to ${connection.remotePeer.toString()}`)
      });

      // Listen for peers disconnecting
      libp2p.connectionManager.addEventListener(
        "peer:disconnect",
        (evt: any) => {
          const connection = evt.detail;
          // console.log(`Disconnected from ${connection.remotePeer.toString()}`)
        }
      );

      libp2p.pubsub.subscribe(roomId);
      libp2p.pubsub.addEventListener("message", (evt: any) => {
        console.log(
          `node received: ${uint8ArrayToString(evt.detail.data)} on topic ${
            evt.detail.topic
          }`
        );
        console.log("event", evt);
      });
    }
  }, [libp2p]);

  const sendMessage = () => {
    libp2p.pubsub
      .publish(roomId, uint8ArrayFromString("Sending a test message!"))
      .catch((err: any) => {
        console.error(err);
      });
  };

  // -------------- END libP2P management -------------------------

  return (
    <div className={styles.playContainer}>
      {libp2p && peerId ? (
        <>
          <div className={styles.cards}>
            <div style={{ display: "flex" }}>
              <div className={styles.deck}>
                <img
                  className={styles.deckCard1}
                  src="/cards/cardBack.svg"
                  width={150}
                  alt="card back"
                />
                <img
                  className={styles.deckCard2}
                  src="/cards/cardBack.svg"
                  width={150}
                  alt="card back"
                />
                <img
                  className={styles.deckCard3}
                  src="/cards/cardBack.svg"
                  width={150}
                  alt="card back"
                />
                <img
                  className={styles.deckCard4}
                  src="/cards/cardBack.svg"
                  width={150}
                  alt="card back"
                />
              </div>
              <div className={styles.middleCard}>
                <img src="/cards/0_hearts.svg" width={150} />
              </div>
            </div>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(roomUri);
              }}
              size="small"
            >
              Copy game url
            </Button>
          </div>
          <div className={styles.players}>
            <div className={styles.opponent}>
              <div
                className={styles.opponentName}
                onClick={() => {
                  navigator.clipboard.writeText(roomUri);
                }}
              >
                Your opponent (20)
              </div>
              {!isYourTurn ? (
                <div className={styles.speechBubble}>
                  <h2 className={styles.opponentText}>
                    I played a jack of spades ! (Trust me bro)
                  </h2>
                </div>
              ) : null}
            </div>
            <div className={styles.playerCards}>
              {playerCards.map((card, index) => (
                <img
                  key={index}
                  onClick={() => onCardDepositChoose(card)}
                  className={styles.card}
                  src={`/cards/${card}_hearts.svg`}
                  width={200}
                />
              ))}
            </div>
            <div className={styles.playerActions}>
              {!isYourTurn ? (
                <>
                  <div className={styles.playerCardsInfo}>
                    You have 20 cards
                  </div>
                  <Button onClick={() => console.log("bijour")} size="small">
                    He Lies
                  </Button>
                </>
              ) : (
                <>
                  <div className={styles.playerCardsInfo}>
                    You have 20 cards
                  </div>
                  <Button onClick={() => console.log("bijour")} size="small">
                    Draw
                  </Button>
                </>
              )}
            </div>
          </div>
          <Modal
            disableAutoFocus
            open={modalCardToTell}
            onClose={() => setModalCardToTell(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <div className={styles.liarMenu}>
              <h1 className={styles.menu_title}>Finalize your turn</h1>
              <div className={styles.container}>
                <div className={styles.depositCard}>
                  <img
                    src={`/cards/${cardToDeposit}_hearts.svg`}
                    width={200}
                    alt="card back"
                  />
                  <h3>Deposited Card</h3>
                </div>
                <div className={styles.depositCard}>
                  <div className={styles.announcedCard}>
                    {allCards.map((card, index) => {
                      return (
                        <img
                          key={index}
                          onClick={() => onCardAnnouncedChoose(card, index)}
                          className={
                            cardToAnnounce && cardToAnnounce.index == index
                              ? styles.modalCardChose
                              : styles.modalCard
                          }
                          src={`/cards/${card}_hearts.svg`}
                          width={70}
                        />
                      );
                    })}
                  </div>
                  <h3>Choose the card you want to announce</h3>
                </div>
              </div>
              <Button
                onClick={() => {
                  setIsYourTurn(!isYourTurn);
                  setModalCardToTell(!modalCardToTell);
                }}
              >
                Play
              </Button>
            </div>
          </Modal>
        </>
      ) : (
        <Button onClick={() => initGame()}>Init game</Button>
      )}
    </div>
  );
};

export default Play;
