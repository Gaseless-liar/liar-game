import gasless_liar_abi from "../abi/GasLessLiar.json";
import { Abi, Contract } from "starknet";

export const gaslessLiarContract: string =
  "0x00cfdceb1ea755e482d91eaf2ef8fbfc29a3628e467c99e67b40b76dadadf837";

export function useGaslessLiarContract() {
    const gaslessGame = new Contract(
        gasless_liar_abi as Abi,
        gaslessLiarContract
      );
    return gaslessGame
}
  