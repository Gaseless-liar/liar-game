import gasless_liar_abi from "../abi/GasLessLiar.json";
import erc20_abi from "../abi/erc20_abi.json";
import { Abi, Contract } from "starknet";

export const gaslessLiarContract: string =
  "0x07c18ab532dc24ae6fff3bc752f9088cdf41f6956a34872d69dc256a30c40c2b";

export const ethereumContract: string =
  "0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7";

export function useGaslessLiarContract() {
    const gaslessGame = new Contract(
        gasless_liar_abi as Abi,
        gaslessLiarContract
      );
    return gaslessGame
}

export function useEthereumContract() {
    const erc20 = new Contract(
        erc20_abi as Abi,
        ethereumContract
      );
    return erc20
}
  