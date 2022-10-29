import gasless_liar_abi from "../abi/GasLessLiar.json";
import { Abi, Contract } from "starknet";

export const gaslessLiarContract: string =
  "0x00cf192bbe0edff598fe8ab801dc36cd656d3c140f0aa68cd56c167d506b1cb3";

export function useGaslessLiarContract() {
    const gaslessGame = new Contract(
        gasless_liar_abi as Abi,
        gaslessLiarContract
      );
    return gaslessGame
}
  