/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
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
import { ec } from "starknet";
import { useGaslessLiarContract } from "../hooks/contracts";
import { getStarkKey } from "starknet/dist/utils/ellipticCurve";


const Setup: NextPage = () => {
  const router = useRouter();
  const wrtcStar = webRTCStar();
  const [isInit, setIsInit] = useState(false);
  const [libp2p, setLibp2p] = useState<any>(null);
  const [roomId, setRoomId] = useState((router.query.room as string) ?? "");
  const [peerId, setPeerId] = useState((router.query.id as string) ?? "");
  const [otherPlayer, setOtherPlayer] = useState("");
  const [roomUri, setRoomUri] = useState("");

  const [gameId, setGameId] = useState((router.query.gameId as any) ?? 0);

  //   Added
  const [player, setPlayer] = useState(1);
  const [keyPair, setKeyPair] = useState({})
  const [otherPubKey, setOtherPubKey] = useState('')
  const gaslessContract = useGaslessLiarContract();

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

    var key_b = generateKey();
    console.log('key_b', key_b)

    setTimeout(function() {
        setPlayer(2);
    }, 2000);
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

    const rand = Math.floor(Math.random() * 12);
    setGameId(rand)

    var topic = "room_" + libp2p.peerId.toString();
    setRoomId(topic);
    setRoomUri(
      `http://localhost:3000/setup?id=${libp2p.peerId.toString()}&room=${topic}&gameId=${rand}`
    );

    generateKey();

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
        console.log('data', data)
        var msg = data.split(',')
        var msgType = msg[0].split(':')
        if (msgType[0] == 'pubKey') {
            setOtherPubKey(msgType[1])
            if (player == 1) {
                // Send public key to player B

                // Send multicall 
                var calls : any[] = [];
                calls.push({
                    contractAddress: gaslessContract.address.toLowerCase(),
                    entrypoint: 'create_game',
                    calldata: [gameId, 10, getStarkKey(keyPair) as string, msgType[1]]
                });

                // game_id, sig(felt, felt) > via function 
                calls.push({
                    contractAddress: gaslessContract.address.toLowerCase(),
                    entrypoint: 'create_game',
                    calldata: [gameId, 10, getStarkKey(keyPair) as string, msgType[1]]
                });

                sendMessage('pubKey:'+ getStarkKey(keyPair));
            }
        }
        
        console.log('msg received', msg);
        // console.log(
        //   `node received: ${uint8ArrayToString(evt.detail.data)} on topic ${
        //     evt.detail.topic
        //   }`
        // );
        console.log("event", evt);
      });
    }
  }, [libp2p]);

  const sendMessage = (data: string) => {
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

  return (
    <>
      <button onClick={() => initGame()}>Init game</button>
      {libp2p && peerId && (
        <>
          <p>Player id: {peerId}</p>
          <p>Room Id : {roomId}</p>
          <p>Link to share: {roomUri}</p>

          <button onClick={() => sendMessage('test')}>Send Message</button>
          <button onClick={() => generateKey()}>Generate key</button>

          {player == 2 ? 
            <button onClick={() => sendMessage('pubKey:'+ getStarkKey(keyPair))}>Connect to player 1</button>
        : <></>}
        </>
      )}
    </>
  );
};

export default Setup;
