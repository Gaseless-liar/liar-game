/* eslint-disable @next/next/no-img-element */
import { Modal } from "@mui/material";
import type { NextPage } from "next";
import { useState } from "react";
import Button from "../components/UI/button";
import styles from "../styles/play.module.css";

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
  const playerCards: number[] = [];
  const playerDepositedCards: number[] = [];
  const opponentDepositedCards: string[] = [];
  const [lastAnnouncedCard, setLastAnnouncedCard] = useState<
    number | undefined
  >();
  const [shouldSendFraudProof, setShouldSendFraudProof] =
    useState<boolean>(false);

  function draw(): void {
    // générer un nb alétoire
    // reveal le hash et demander à l'adversaire de générer un nb alétoire
    // recevoir le nb alétoire de l'adversaire
    // playerCards.push(s1 + s2 modulo 12)
  }

  function depositCard(): void {
    // enlever cardToDeposit de playerCards
    // ajouter cardToDeposit à playerDepositedCards
    // prendre cardToAnnounce et setLastAnnouncedCard()
    // envoyer cardToAnnounce et hash de la card déposée
    // changer tour de jeu
  }

  function tellThatHeIsLying(): void {
    // Envoie au deuxième joueur qu'il ment
    // if (Reveal la card == perdu ) {
    // retrieveCards()
    // } else if (Reveal la card == perdu) {
    // affichage que j'ai gagné
    // setLastAnnouncedCard(0)
    // playerDepositedCards = [];
    // }
    // - ou envoie de fraud proof
  }

  function retrieveCards(): void {
    // demander opponentDepositedCards et vérifier que ces valeurs sont cohérentes avec les hashs de opponentDepositedCards
    // si différent setShouldSendFraudProof(true)
    // ajouter les opponentDepositedCards à playerCards
    // changer tour de jeu
  }

  function onCardDepositChoose(card: number): void {
    setModalCardToTell(true);
    setCardToDeposit(card);
  }

  function onCardAnnouncedChoose(card: number, index: number): void {
    setCardToAnnounce({ index, card });
  }

  return (
    <div className={styles.playContainer}>
      <div className={styles.cards}>
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
      <div className={styles.players}>
        <div className={styles.opponent}>
          <div className={styles.opponentName}>Your opponent (20)</div>
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
              <div className={styles.playerCardsInfo}>You have 20 cards</div>
              <Button size="small">He Lies</Button>
            </>
          ) : (
            <>
              <div className={styles.playerCardsInfo}>You have 20 cards</div>
              <Button size="small">Draw</Button>
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
          <Button>Play</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Play;
