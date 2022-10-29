/* eslint-disable @next/next/no-img-element */
import { Modal } from "@mui/material";
import type { NextPage } from "next";
import Button from "../components/UI/button";
import styles from "../styles/play.module.css";
import { useState, useEffect, useCallback } from "react";
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
import { useEthereumContract, useGaslessLiarContract } from "../hooks/contracts";
import { ec, getStarkKey, sign } from "starknet/dist/utils/ellipticCurve";
import { getStarknet, IStarknetWindowObject } from "get-starknet";
import { GetBlockResponse } from "starknet";
import BN from "bn.js";
import { getKeyPair } from "starknet/utils/ellipticCurve";
import { checkIntegrity, checkIntegrity2, makeState1, makeState2, makeState3 } from "../utils/state";

const Play: NextPage = () => {
  //Front end Data
  const allCards: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const [modalCardToTell, setModalCardToTell] = useState<boolean>(false);
  const [cardToDeposit, setCardToDeposit] = useState<undefined | number>();
  const [cardToAnnounce, setCardToAnnounce] = useState<any>({
    index: 0,
    card: 0,
  });
  const [startingCard, setStartingCard] = useState<any>();
  const [isOnChainCreationAvailable, setIsOnChainCreationAvailable] =
    useState<boolean>(false);

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
  const [areTransactionsPassed, setAreTransactionsPassed] = useState(false);
  const [madeAllStates, setMadeAllStates] = useState(false)

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
  const [gameId, setGameId] = useState((router.query.gameId as any) ?? 0);
  const [otherPlayer, setOtherPlayer] = useState("");
  const [roomUri, setRoomUri] = useState("");
  const [player, setPlayer] = useState(1);
  const [keyPair, setKeyPair] = useState({})
  const [otherPubKey, setOtherPubKey] = useState('')
  const gaslessContract = useGaslessLiarContract();
  const ethContract = useEthereumContract();
  const [isWaitingForTx, setIsWaitingForTx] = useState(false)


  // ----------- blocks, transactions -----------
  const [transactions, setTransactions] = useState<any>(null)
  const [_starknet, setStarknet] = useState<IStarknetWindowObject>()
  const [block, setBlock] = useState<GetBlockResponse | undefined>(undefined);
  const [loading, setLoading] = useState<boolean | undefined>(undefined);

  const fetchBlock = useCallback(() => {
    if (_starknet) {
      _starknet.account
        .getBlock()
        .then((newBlock: any) => {
          setBlock((oldBlock : any) => {
            if (oldBlock?.block_hash === newBlock.block_hash) {
              return oldBlock;
            }
            console.log('newBlock', newBlock)

            console.log('transactions', transactions)
            if (transactions)
              console.log('length', Object.keys(transactions).length)
              
            if (transactions && Object.keys(transactions).length > 0) {

                const tx = newBlock.transactions.filter((transaction: any) => {
                  return transaction.transaction_hash == transactions.transaction_hash;
                });

                if (tx.length > 0) {
                  console.log('transaction was accepted', tx)

                  if (transactions.player == 1) {
                    console.log('sending msg to P2')

                    var btnMsg = document.getElementById("sendKeyA");
                    if (btnMsg) {
                      btnMsg.click()
                      console.log('send pubKeyA')
                    }
                  } else if (transactions.player == 2) {
                    setAreTransactionsPassed(true)
                    var btnMsg = document.getElementById("sendReady");
                    if (btnMsg) {
                      btnMsg.click()
                      console.log('send ready msg')
                    }
                  }
                  setTransactions([])
                }
            }

            return newBlock;
          });
        })
        .catch((error: any) => {
          console.log("failed fetching block", error);
        })
        .finally(() => setLoading(false));
      }
    }, [_starknet, block, transactions])


  useEffect(() => {
    setLoading(true);
    // Fetch block immediately
    fetchBlock();
    const intervalId = setInterval(() => {
      fetchBlock();
    }, 10000);
    return () => clearInterval(intervalId);
  }, [fetchBlock]);


    // ----------- END blocks, transactions -----------

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
          '/ip4/0.0.0.0/tcp/0',
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
    await libp2p.start();
    setLibp2p(libp2p);
    setPeerId(libp2p.peerId.toString());
    const _starknet = await getStarknet();
    await _starknet.enable({ showModal: true });
    setStarknet(_starknet)
    generateKey();
    const timer = setTimeout(() => {
      var btnMsg = document.getElementById("sendKeyB");
      if (btnMsg) {
        btnMsg.click()
        console.log('CLICKING')
      }
    }, 1000);
    setIsInit(true);
    setPlayer(2);
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
          '/ip4/0.0.0.0/tcp/0',
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

    const rand = Math.floor(Math.random() * 12);
    setGameId(rand)

    var topic = "room_" + libp2p.peerId.toString();
    console.log('roomId', topic)
    setRoomId(topic);
    setRoomUri(
      `http://localhost:3000/play?id=${libp2p.peerId.toString()}&room=${topic}&gameId=${rand}`
    );

    generateKey();
    const _starknet = await getStarknet();
    await _starknet.enable({ showModal: true });
    setStarknet(_starknet)

    console.log('_starknet', _starknet)

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
      setGameId(router.query.gameId as any)
      joinGame(router.query.id as string);
    }
  }, [roomId, peerId, router.query]);

  const [state1, setState1] = useState<any>()
  const [s1, setS1] = useState<any>()
  const [h1, setH1] = useState<any>()
  const [sig1, setSig1] = useState<any>()
  const [sig2, setSig2] = useState<any>()
  const [sig3, setSig3] = useState<any>()
  const [state2, setState2] = useState<any>()
  const [state3, setState3] = useState<any>()
  const [stateTable, setStateTable] = useState<any>([])
  const [ongoingDispute, setOngoingDispute] = useState(false)

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

        var data = uint8ArrayToString(evt.detail.data)
        console.log('message received', data)
        var msg = data.split('|')

        if (msg[0] == 'pubKeyB') {
            setOtherPubKey(msg[1])
            if(player == 1) startGame()
        } else if (msg[0] == 'pubKeyA') {
          setOtherPubKey(msg[1])
          startGameP2()
        } else if (msg[0] == 'ready') {
          launchState1()
        } else if (msg[0] == 'state1') {
          console.log('state1 received from A', msg)
          const _h1 = msg[1].split(':')[1]
          const _sig1 = msg[2].split(':')[1]
          const _sig = _sig1.split(',')
           const _state1 = {
            'gameId' : gameId,
            'h1' : _h1,
            'type' : 1,
           }
          stateTable.push(_state1)
          var _key = new BN(otherPubKey.substring(2), 16)
          const [generateDisputeId, sigState1] = checkIntegrity(_state1, [_sig[0], _sig[1]], gameId, _key, keyPair, stateTable)

          if (!generateDisputeId && !sigState1) {
            const [state2, sig2] = makeState2(_state1, [_sig[0], _sig[1]], gameId, _key, keyPair, stateTable)
            setState2(state2)
            setSig2(sig2)
            const timer = setTimeout(() => {
              var btnMsg = document.getElementById("sendState2");
              if (btnMsg) {
                btnMsg.click()
                console.log('CLICKING state 2')
              }
            }, 1000);
          } else {
            // ! IF dispute_id > call open_dispute_state_1(dispute_id, game_id, h1, sig) > jeu sur pause + dire qu'il y a un problème 
            setOngoingDispute(true)
            if(_starknet) {
              var _account = _starknet?.account.address.slice(2)
              var _sig_ = sign(keyPair, _account as string)
              _starknet.account.execute({
                contractAddress: gaslessContract.address.toLowerCase(),
                entrypoint: 'open_dispute_state_1',
                calldata: [generateDisputeId, gameId, _h1, _sig_]
              }).then((response: any) => {
                response.player = player
                setTransactions(response)

                const timer = setTimeout(() => {
                  var btnMsg = document.getElementById("sendDispute");
                  if (btnMsg) {
                    btnMsg.click()
                    console.log('CLICKING Dispute state 2')
                  }
                }, 1000);
              })
            }
          }
        } else if (msg[0] == 'state2') {
          console.log('state2 received from B', msg)
          const prevStateHash = msg[1].split(':')[1]
          const _s2 = msg[2].split(':')[1]
          const _sig2 = msg[3].split(':')[1]
          const _sig = _sig2.split(',')
          const _state2 = {
            'gameId' : gameId,
            'prevStateHash' : prevStateHash,
            's2' : _s2,
            'h1' : stateTable[0].h1,
            'type' : 2
          }
          stateTable.push(_state2)

          var _key = new BN(otherPubKey.substring(2), 16)
          const [generateDisputeId, sigState1] = checkIntegrity2(_state2, [_sig[0], _sig[1]], s1, stateTable[0].h1, gameId, otherPubKey, keyPair, stateTable)

          if (!generateDisputeId && !sigState1) {
            setOngoingDispute(true)
            if(_starknet) {
              var _account = _starknet?.account.address.slice(2)
              var _sig_ = sign(keyPair, _account as string)
              _starknet.account.execute({
                contractAddress: gaslessContract.address.toLowerCase(),
                entrypoint: 'open_dispute_state_2',
                calldata: [generateDisputeId, gameId, prevStateHash, stateTable[0].h1, [_sig[0], _sig[1]]]
              }).then((response: any) => {
                response.player = player
                setTransactions(response)

                const timer = setTimeout(() => {
                  var btnMsg = document.getElementById("sendDispute");
                  if (btnMsg) {
                    btnMsg.click()
                    console.log('CLICKING Dispute state 2')
                  }
                }, 1000);
              })
            }

          } else {
            const [state3, sig] = makeState3(_state2, [_sig[0], _sig[1]], s1, stateTable[0].h1, gameId, otherPubKey, keyPair, stateTable)
            setState3(state3)
            setSig3(sig)
            const timer = setTimeout(() => {
              var btnMsg = document.getElementById("sendState3");
              if (btnMsg) {
                btnMsg.click()
                console.log('CLICKING state 3')
              }
            }, 1000);
          }
        } else if (msg[0] == 'state3') {
          // Rebuild state3
          console.log('state3 received from A', msg)
          const prevStateHash = msg[1].split(':')[1]
          const _s1 = msg[2].split(':')[1]
          const _startingCard = msg[3].split(":")[1]
          const _sig2 = msg[5].split(':')[1]
          const _sig = _sig2.split(',')
          console.log('_sig', _sig)

          const _state3 = {
            'gameId': gameId,
            'prevStateHash': prevStateHash,
            's1': _s1,
            'startingCard': _startingCard,
            'type': 3
          };
          stateTable.push(_state3)
          // setAreTransactionsPassed(true)
          setMadeAllStates(true)
          var card : any = new BN(_startingCard, 16)
          setStartingCard(card.umod(13));
          console.log('card', card)

          const timer = setTimeout(() => {
            var btnMsg = document.getElementById("canPlay");
            if (btnMsg) {
              btnMsg.click()
              console.log('CLICKING canPlay')
            }
          }, 1000);
        } else if (msg[0] == 'sendDispute') {
          console.log('statedispute')
          setOngoingDispute(true)
        } else if (msg[0] == 'canPlay') {
          console.log('can Play to player B')
          // setAreTransactionsPassed(true);
          setMadeAllStates(true)
          var card : any = new BN(stateTable[2].startingCard, 16)
          setStartingCard(card.umod(13));
          console.log('card', card)
        }
      });
    }
  }, [libp2p, isInit]);

  const sendMessage = (data: string) => {
    console.log('sending msg', data)
    libp2p.pubsub
      .publish(roomId, uint8ArrayFromString(data))
      .catch((err: any) => {
        console.error(err);
      });
  };

  const generateKey = () => {
    var _key = ec.genKeyPair()
    setKeyPair(_key)
    return getStarkKey(_key)
  }

  const startGame = async () => {
    console.log('starting game')
    var calls : any[] = [];
    var _account = _starknet?.account.address.slice(2)
    var _sig = sign(keyPair, _account as string)
    calls.push({
      contractAddress: ethContract.address.toLowerCase(),
      entrypoint: 'approve',
      calldata: [gaslessContract.address, 500, 0]
    });
    calls.push({
      contractAddress: gaslessContract.address.toLowerCase(),
      entrypoint: 'deposit',
      calldata: [500, 0]
    });
    calls.push({
        contractAddress: gaslessContract.address.toLowerCase(),
        entrypoint: 'create_game',
        calldata: [gameId, 500, 0, getStarkKey(keyPair), otherPubKey]
    });
    calls.push({
      contractAddress: gaslessContract.address.toLowerCase(),
      entrypoint: 'set_a_user',
      calldata: [gameId, _sig[0], _sig[1]]
    });
    if(_starknet)
      _starknet.account.execute(calls).then((response: any) => {
        response.player = player
        setTransactions(response)
      })
  }

  const startGameP2 = async () => {
    if(_starknet) {
      var _account = _starknet?.account.address.slice(2)
      var _sig = sign(keyPair, _account as string)
      var calls : any[] = [];

      calls.push({
        contractAddress: ethContract.address.toLowerCase(),
        entrypoint: 'approve',
        calldata: [gaslessContract.address, 500, 0]
      });
      calls.push({
        contractAddress: gaslessContract.address.toLowerCase(),
        entrypoint: 'deposit',
        calldata: [500, 0]
      });
      calls.push({
        contractAddress: gaslessContract.address.toLowerCase(),
        entrypoint: 'set_b_user',
        calldata: [gameId, _sig[0], _sig[1]]
      });
      _starknet.account.execute(calls).then((response: any) => {
        response.player = player
        setTransactions(response)
      })
    }
  }

  const launchState1 = () => {
    console.log('launching state 1')
    const [ state1, sig, s1, h1 ] = makeState1(gameId, keyPair, stateTable);
    setState1(state1)
    setH1(h1)
    setS1(s1)
    setSig1(sig)
    const timer = setTimeout(() => {
      var btnMsg = document.getElementById("sendState1");
      if (btnMsg) {
        btnMsg.click()
        console.log('CLICKING state 1')
      }
    }, 1000);
  }

  const testSig = () => {
    // getKeyPair(new BN(1))
    // @ts-ignore
    var _account = _starknet.account.address.slice(2)
    console.log('account', _account)
    var _sig = sign(keyPair, _account as string)
    console.log('sign', _sig)
  }

  // -------------- END libP2P management -------------------------

  return (
    <div className={styles.playContainer}>
      {libp2p && peerId ? (
        madeAllStates ? (
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
          <div style={{ display: "flex", flexDirection: "column" }}>
            {isOnChainCreationAvailable ? (
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(roomUri);
                }}
                size="small"
              >
                Launch your game onchain
              </Button>
            ) : player == 1 ? (
              <>
                <h1 style={{ 'color': '#FFF' }}>We&apos;re waiting for you&apos;re opponent</h1>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(roomUri);
                  }}
                  size="small"
                >
                  Click to Copy game url
                </Button>
              </>
            ) : (
              <>
                <h1 style={{ 'color': '#FFF' }}>We&apos;re initializing the game</h1>
                {!areTransactionsPassed ? (
                  <Button
                    onClick={() => {
                      sendMessage('pubKeyB|'+ getStarkKey(keyPair))
                    }}
                    size="small"
                  >
                    Connect to player 1
                  </Button>
                )
                : <></>}
              </>
            )}
          </div>
        )
      ) : (
        <Button onClick={() => initGame()}>Create game</Button>
      )}
      <button id='sendKeyB' onClick={() => sendMessage('pubKeyB|'+ getStarkKey(keyPair))} style={{display: 'none'}}></button>
      <button id='sendKeyA' onClick={() => sendMessage('pubKeyA|'+ getStarkKey(keyPair))} style={{display: 'none'}}></button>
      <button id='sendReady' onClick={() => sendMessage('ready|')} style={{display: 'none'}}></button>
      <button id='sendState1' onClick={() => sendMessage('state1|h1:'+h1+'|sig:'+sig1)} style={{display: 'none'}}></button>
      <button id='sendState2' onClick={() => sendMessage('state2|prevStateHash:'+state2.prevStateHash+'|s2:'+state2.s2+'|h1:'+state2.h1+'|sig:'+sig2)} style={{display: 'none'}}></button>
      <button id='sendState3' onClick={() => sendMessage('state3|prevStateHash:'+state3.prevStateHash+'|s1:'+state3.s1+'|startingCard:'+state3.startingCard+'|type:'+state3.type+'|sig:'+sig3)} style={{display: 'none'}}></button>
      <button id='sendDispute' onClick={() => sendMessage('disputeOngoing|')} style={{display: 'none'}}></button>
      <button id='canPlay' onClick={() => sendMessage('canPlay|')} style={{display: 'none'}}></button>
    </div>
  );
};

export default Play;
